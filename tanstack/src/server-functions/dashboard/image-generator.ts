import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { sql } from 'drizzle-orm'
import type { Language } from '@/types/doa.types'
import type { ImageExportSettings } from '@/types/image-customization.types'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { doaImageGeneration } from '@/db/schema'
import {
  generateDoaImageWithSharp,
  loadDoaBySlug,
} from '@/lib/server-image-generator'
import { validateExportSettings } from '@/lib/customization-access'

const MALAYSIA_TIME_ZONE = 'Asia/Kuala_Lumpur'

// Input validation types
interface GenerateImageInput {
  doaSlug: string
  backgroundId: number // 1-12 for the JPEG files
  language: Language
}

// Input for recording browser-side image generation.
interface RecordImageGenerationInput {
  doaSlug: string
  exportSettings?: ImageExportSettings
}

// Structured result type (following createDoaList pattern)
type GenerateImageResult =
  | {
      success: true
      imageBase64: string
      filename: string
      mimeType: string
    }
  | {
      success: false
      error: {
        code: 'DOA_NOT_FOUND' | 'GENERATION_FAILED'
        message: string
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

function getMalaysiaMidnightUtc(date: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: MALAYSIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value) - 1
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return new Date(Date.UTC(year, month, day, -8, 0, 0, 0))
}

async function recordSuccessfulImageGeneration(userId: string) {
  const now = new Date()
  const todayMidnight = getMalaysiaMidnightUtc(now)
  const tomorrowMidnight = new Date(
    todayMidnight.getTime() + 24 * 60 * 60 * 1000,
  )

  await db
    .insert(doaImageGeneration)
    .values({
      userId,
      generationsToday: 1,
      lastGeneratedAt: now,
      totalGenerations: 1,
    })
    .onConflictDoUpdate({
      target: doaImageGeneration.userId,
      set: {
        generationsToday: sql<number>`case
          when ${doaImageGeneration.lastGeneratedAt} >= ${todayMidnight}
            and ${doaImageGeneration.lastGeneratedAt} < ${tomorrowMidnight}
          then ${doaImageGeneration.generationsToday} + 1
          else 1
        end`,
        lastGeneratedAt: now,
        totalGenerations: sql<number>`${doaImageGeneration.totalGenerations} + 1`,
        updatedAt: now,
      },
    })
}

// ============================================
// GENERATE DOA IMAGE
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

    return data
  })
  .handler(async ({ data }): Promise<GenerateImageResult> => {
    const session = await requireAuth()
    const userId = session.user.id
    const { doaSlug, backgroundId, language } = data

    // Load doa data and generate image before updating usage analytics.
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

    await recordSuccessfulImageGeneration(userId)

    const imageBase64 = imageBuffer.toString('base64')
    const filename = `getdoa-${doaSlug}-${Date.now()}.png`

    return {
      success: true,
      imageBase64,
      filename,
      mimeType: 'image/png',
    }
  })

// ============================================
// RECORD IMAGE GENERATION (browser-side generation)
// Tracks usage analytics without server-side image generation.
// ============================================

// Result type for recording image generation
type RecordImageGenerationResult =
  | {
      success: true
    }
  | {
      success: false
      error: {
        code: 'INVALID_EXPORT_SETTINGS'
        message: string
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
  .handler(async ({ data }): Promise<RecordImageGenerationResult> => {
    const session = await requireAuth()
    const userId = session.user.id

    if (data.exportSettings) {
      const validation = validateExportSettings(data.exportSettings)
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'INVALID_EXPORT_SETTINGS',
            message: validation.errors[0],
          },
        }
      }
    }

    await recordSuccessfulImageGeneration(userId)

    return {
      success: true,
    }
  })
