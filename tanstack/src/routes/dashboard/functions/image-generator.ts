import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'
import {
  generateDoaImageWithSharp,
  loadDoaBySlug,
} from '@/lib/server-image-generator'
import type { Language } from '@/types/doa.types'

// Input validation types
interface GenerateImageInput {
  doaSlug: string
  backgroundId: number // 1-12 for the JPEG files
  language: Language
}

interface GenerateImageOutput {
  imageBase64: string // Base64 encoded PNG
  filename: string
  mimeType: string
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

// Server function to generate the doa image
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
  .handler(async ({ data }): Promise<GenerateImageOutput> => {
    await requireAuth()

    const { doaSlug, backgroundId, language } = data

    // Load doa data on server
    const doaData = await loadDoaBySlug(doaSlug)
    if (!doaData) {
      throw new Error(`Doa not found: ${doaSlug}`)
    }

    // Generate image using Sharp
    const imageBuffer = await generateDoaImageWithSharp({
      doa: doaData,
      backgroundId,
      language,
    })

    // Convert to base64 for transport
    const imageBase64 = imageBuffer.toString('base64')
    const filename = `getdoa-${doaSlug}-${Date.now()}.png`

    return {
      imageBase64,
      filename,
      mimeType: 'image/png',
    }
  })
