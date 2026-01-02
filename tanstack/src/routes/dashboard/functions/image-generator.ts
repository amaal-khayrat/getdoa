import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { doaImageGeneration } from '@/db/schema'
import {
  generateDoaImageWithSharp,
  loadDoaBySlug,
} from '@/lib/server-image-generator'
import {
  calculateImageLimitInfo,
  isToday,
  IMAGE_LIMIT_CONFIG,
  type ImageLimitInfo,
} from '@/lib/image-limit'
import type { Language } from '@/types/doa.types'

// Input validation types
interface GenerateImageInput {
  doaSlug: string
  backgroundId: number // 1-12 for the JPEG files
  language: Language
}

// Input for recording image generation (limit tracking only)
interface RecordImageGenerationInput {
  doaSlug: string
}

// Structured result type (following createDoaList pattern)
type GenerateImageResult =
  | {
      success: true
      imageBase64: string
      filename: string
      mimeType: string
      limitInfo: ImageLimitInfo
    }
  | {
      success: false
      error: {
        code: 'DAILY_LIMIT_REACHED' | 'DOA_NOT_FOUND' | 'GENERATION_FAILED'
        message: string
        limitInfo?: ImageLimitInfo
      }
    }

// Auth helper (reuses pattern from existing functions)
async function requireAuth() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in to generate images')
  }

  return session
}

// ============================================
// GET IMAGE LIMIT INFO
// ============================================
export const getImageLimitInfo = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => {
    if (!data.userId) throw new Error('User ID required')
    return data
  })
  .handler(async ({ data }): Promise<ImageLimitInfo> => {
    const record = await db.query.doaImageGeneration.findFirst({
      where: eq(doaImageGeneration.userId, data.userId),
    })

    if (!record) {
      // No record = never generated, full quota available
      return calculateImageLimitInfo(0, null, 0)
    }

    return calculateImageLimitInfo(
      record.generationsToday,
      record.lastGeneratedAt,
      record.totalGenerations,
    )
  })

// ============================================
// GENERATE DOA IMAGE (with limit check)
// ============================================
export const generateDoaImage = createServerFn({
  method: 'POST',
})
  .inputValidator((data: GenerateImageInput) => {
    // Validate input
    if (!data.doaSlug || typeof data.doaSlug !== 'string') {
      throw new Error('Invalid doa slug')
    }

    if (
      typeof data.backgroundId !== 'number' ||
      data.backgroundId < 1 ||
      data.backgroundId > 12
    ) {
      throw new Error('Invalid background image ID (must be 1-12)')
    }

    if (data.language !== 'en' && data.language !== 'my') {
      throw new Error('Invalid language (must be "en" or "my")')
    }

    return data
  })
  .handler(async ({ data }): Promise<GenerateImageResult> => {
    const session = await requireAuth()
    const userId = session.user.id
    const { doaSlug, backgroundId, language } = data

    // Step 1: Check limit FIRST (outside transaction - read only)
    const existingRecord = await db.query.doaImageGeneration.findFirst({
      where: eq(doaImageGeneration.userId, userId),
    })

    const currentUsed =
      existingRecord && isToday(existingRecord.lastGeneratedAt)
        ? existingRecord.generationsToday
        : 0

    if (currentUsed >= IMAGE_LIMIT_CONFIG.DAILY_LIMIT) {
      const limitInfo = calculateImageLimitInfo(
        currentUsed,
        existingRecord?.lastGeneratedAt ?? null,
        existingRecord?.totalGenerations ?? 0,
      )

      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message:
            'Daily limit reached. You can generate 1 image per day. Please try again tomorrow.',
          limitInfo,
        },
      }
    }

    // Step 2: Load doa data and generate image BEFORE updating count
    // This ensures we don't charge the user if generation fails
    const doaData = await loadDoaBySlug(doaSlug)
    if (!doaData) {
      return {
        success: false,
        error: {
          code: 'DOA_NOT_FOUND',
          message: `Doa not found: ${doaSlug}`,
        },
      }
    }

    let imageBuffer: Buffer
    try {
      imageBuffer = await generateDoaImageWithSharp({
        doa: doaData,
        backgroundId,
        language,
      })
    } catch (err) {
      console.error('Image generation failed:', err)
      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate image. Please try again.',
        },
      }
    }

    // Step 3: Update count in a transaction (only after successful generation)
    const now = new Date()
    const result = await db.transaction(async (tx) => {
      // Re-check limit inside transaction to prevent race conditions
      const record = await tx.query.doaImageGeneration.findFirst({
        where: eq(doaImageGeneration.userId, userId),
      })

      const usedToday =
        record && isToday(record.lastGeneratedAt)
          ? record.generationsToday
          : 0

      // Double-check limit (race condition protection)
      if (usedToday >= IMAGE_LIMIT_CONFIG.DAILY_LIMIT) {
        return {
          blocked: true as const,
          usedToday,
          totalGenerations: record?.totalGenerations ?? 0,
        }
      }

      if (record) {
        // Reset count if new day, otherwise increment
        const newCount = isToday(record.lastGeneratedAt)
          ? record.generationsToday + 1
          : 1

        await tx
          .update(doaImageGeneration)
          .set({
            generationsToday: newCount,
            lastGeneratedAt: now,
            totalGenerations: record.totalGenerations + 1,
          })
          .where(eq(doaImageGeneration.userId, userId))

        return {
          blocked: false as const,
          usedToday: newCount,
          totalGenerations: record.totalGenerations + 1,
        }
      } else {
        // First generation ever
        await tx.insert(doaImageGeneration).values({
          userId,
          generationsToday: 1,
          lastGeneratedAt: now,
          totalGenerations: 1,
        })

        return { blocked: false as const, usedToday: 1, totalGenerations: 1 }
      }
    })

    // Handle race condition (another request completed between check and update)
    if (result.blocked) {
      const limitInfo = calculateImageLimitInfo(
        result.usedToday,
        existingRecord?.lastGeneratedAt ?? null,
        result.totalGenerations,
      )
      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: 'Daily limit reached. Please try again tomorrow.',
          limitInfo,
        },
      }
    }

    // Step 4: Return success with image data
    const imageBase64 = imageBuffer.toString('base64')
    const filename = `getdoa-${doaSlug}-${Date.now()}.png`

    const limitInfo = calculateImageLimitInfo(
      result.usedToday,
      now,
      result.totalGenerations,
    )

    return {
      success: true,
      imageBase64,
      filename,
      mimeType: 'image/png',
      limitInfo,
    }
  })

// ============================================
// RECORD IMAGE GENERATION (browser-side generation)
// Tracks usage limits without server-side image generation
// ============================================

// Result type for recording image generation
type RecordImageGenerationResult =
  | {
      success: true
      limitInfo: ImageLimitInfo
    }
  | {
      success: false
      error: {
        code: 'DAILY_LIMIT_REACHED' | 'UNAUTHORIZED'
        message: string
        limitInfo?: ImageLimitInfo
      }
    }

export const recordImageGeneration = createServerFn({
  method: 'POST',
})
  .inputValidator((data: RecordImageGenerationInput) => {
    if (!data.doaSlug || typeof data.doaSlug !== 'string') {
      throw new Error('Invalid doa slug')
    }
    return data
  })
  .handler(async ({ data: _data }): Promise<RecordImageGenerationResult> => {
    const session = await requireAuth()
    const userId = session.user.id

    // Step 1: Check limit FIRST (outside transaction - read only)
    const existingRecord = await db.query.doaImageGeneration.findFirst({
      where: eq(doaImageGeneration.userId, userId),
    })

    const currentUsed =
      existingRecord && isToday(existingRecord.lastGeneratedAt)
        ? existingRecord.generationsToday
        : 0

    if (currentUsed >= IMAGE_LIMIT_CONFIG.DAILY_LIMIT) {
      const limitInfo = calculateImageLimitInfo(
        currentUsed,
        existingRecord?.lastGeneratedAt ?? null,
        existingRecord?.totalGenerations ?? 0,
      )

      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message:
            'Daily limit reached. You can generate 1 image per day. Please try again tomorrow.',
          limitInfo,
        },
      }
    }

    // Step 2: Update count in a transaction
    const now = new Date()
    const result = await db.transaction(async (tx) => {
      // Re-check limit inside transaction to prevent race conditions
      const record = await tx.query.doaImageGeneration.findFirst({
        where: eq(doaImageGeneration.userId, userId),
      })

      const usedToday =
        record && isToday(record.lastGeneratedAt)
          ? record.generationsToday
          : 0

      // Double-check limit (race condition protection)
      if (usedToday >= IMAGE_LIMIT_CONFIG.DAILY_LIMIT) {
        return {
          blocked: true as const,
          usedToday,
          totalGenerations: record?.totalGenerations ?? 0,
        }
      }

      if (record) {
        // Reset count if new day, otherwise increment
        const newCount = isToday(record.lastGeneratedAt)
          ? record.generationsToday + 1
          : 1

        await tx
          .update(doaImageGeneration)
          .set({
            generationsToday: newCount,
            lastGeneratedAt: now,
            totalGenerations: record.totalGenerations + 1,
          })
          .where(eq(doaImageGeneration.userId, userId))

        return {
          blocked: false as const,
          usedToday: newCount,
          totalGenerations: record.totalGenerations + 1,
        }
      } else {
        // First generation ever
        await tx.insert(doaImageGeneration).values({
          userId,
          generationsToday: 1,
          lastGeneratedAt: now,
          totalGenerations: 1,
        })

        return { blocked: false as const, usedToday: 1, totalGenerations: 1 }
      }
    })

    // Handle race condition
    if (result.blocked) {
      const limitInfo = calculateImageLimitInfo(
        result.usedToday,
        existingRecord?.lastGeneratedAt ?? null,
        result.totalGenerations,
      )
      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: 'Daily limit reached. Please try again tomorrow.',
          limitInfo,
        },
      }
    }

    // Return success with updated limit info
    const limitInfo = calculateImageLimitInfo(
      result.usedToday,
      now,
      result.totalGenerations,
    )

    return {
      success: true,
      limitInfo,
    }
  })
