/**
 * Browser-based doa image generator for single doa with background image
 * Matches styling of the server-side Sharp generator
 */

import { preloadSimpoFont } from '@/utils/font-loader'
import type { DoaItem, Language } from '@/types/doa.types'

// Image dimensions (matching server)
const IMAGE_WIDTH = 1728
const IMAGE_HEIGHT = 2304

// Text styling constants
const OVERLAY_OPACITY = 0.45
const DOA_NAME_FONT_SIZE = 48
const ARABIC_FONT_SIZE = 99
const ARABIC_LINE_HEIGHT = 179
const TRANSLATION_FONT_SIZE = 45
const TRANSLATION_LINE_HEIGHT = 63
const BRANDING_FONT_SIZE = 36
const BRANDING_SUBTEXT_SIZE = 24

// Layout positions
const DOA_NAME_Y = 180
const ARABIC_START_Y = 380
const BOTTOM_MARGIN = 80

interface GenerateSingleDoaImageConfig {
  doa: DoaItem
  backgroundId: number
  language: Language
}

/**
 * Wrap text into lines for canvas rendering
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word

    if (testLine.length > maxChars && currentLine) {
      lines.push(currentLine.trim())
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim())
  }

  return lines.length > 0 ? lines : [text]
}

/**
 * Load background image
 */
async function loadBackgroundImage(backgroundId: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load background image ${backgroundId}`))
    img.src = `/assets/ai/${backgroundId}.jpeg`
  })
}

/**
 * Draw text centered horizontally
 */
function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  font: string,
  fillStyle: string
): void {
  ctx.font = font
  ctx.fillStyle = fillStyle
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, IMAGE_WIDTH / 2, y)
}

/**
 * Draw multiline Arabic text centered
 */
function drawArabicText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startY: number,
  lineHeight: number
): void {
  ctx.font = `${ARABIC_FONT_SIZE}px 'Simpo', 'Amiri Quran', 'Scheherazade New', Arial, sans-serif`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = 'rtl'

  // Add text shadow effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight
    ctx.fillText(line, IMAGE_WIDTH / 2, y)
  })

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Draw multiline translation text centered
 */
function drawTranslationText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startY: number,
  lineHeight: number
): void {
  ctx.font = `${TRANSLATION_FONT_SIZE}px 'Noto Sans', 'DejaVu Sans', Arial, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = 'ltr'

  // Add text shadow effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight
    ctx.fillText(line, IMAGE_WIDTH / 2, y)
  })

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Generate a doa image using Canvas API (browser-side)
 */
export async function generateSingleDoaImage(
  config: GenerateSingleDoaImageConfig
): Promise<Blob> {
  const { doa, backgroundId, language } = config

  // Ensure font is loaded
  await preloadSimpoFont()

  // Load background image
  const bgImage = await loadBackgroundImage(backgroundId)

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_WIDTH
  canvas.height = IMAGE_HEIGHT
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Draw background image (cover)
  const scale = Math.max(IMAGE_WIDTH / bgImage.width, IMAGE_HEIGHT / bgImage.height)
  const scaledWidth = bgImage.width * scale
  const scaledHeight = bgImage.height * scale
  const offsetX = (IMAGE_WIDTH - scaledWidth) / 2
  const offsetY = (IMAGE_HEIGHT - scaledHeight) / 2
  ctx.drawImage(bgImage, offsetX, offsetY, scaledWidth, scaledHeight)

  // Draw dark overlay
  ctx.fillStyle = `rgba(0, 0, 0, ${OVERLAY_OPACITY})`
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)

  // Get text content based on language
  const doaName = language === 'my' ? doa.nameMy : doa.nameEn
  const translation = language === 'my' ? doa.meaningMy : doa.meaningEn

  // Draw doa name at top
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  drawCenteredText(
    ctx,
    doaName,
    DOA_NAME_Y,
    `bold ${DOA_NAME_FONT_SIZE}px 'Noto Serif', 'DejaVu Serif', Georgia, serif`,
    'white'
  )
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Wrap and draw Arabic text
  const wrappedArabic = wrapText(doa.content, 50)
  drawArabicText(ctx, wrappedArabic, ARABIC_START_Y, ARABIC_LINE_HEIGHT)

  // Calculate translation position
  const arabicEndY = ARABIC_START_Y + wrappedArabic.length * ARABIC_LINE_HEIGHT
  const translationStartY = Math.min(arabicEndY + 150, IMAGE_HEIGHT - 500)

  // Wrap and draw translation
  if (translation) {
    const wrappedTranslation = wrapText(translation, 65)
    drawTranslationText(ctx, wrappedTranslation, translationStartY, TRANSLATION_LINE_HEIGHT)
  }

  // Draw branding at bottom
  const brandingY = IMAGE_HEIGHT - BOTTOM_MARGIN - 40
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  drawCenteredText(
    ctx,
    'GetDoa',
    brandingY,
    `600 ${BRANDING_FONT_SIZE}px 'Noto Serif', 'DejaVu Serif', Georgia, serif`,
    'white'
  )

  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  drawCenteredText(
    ctx,
    'getdoa.com',
    IMAGE_HEIGHT - BOTTOM_MARGIN,
    `${BRANDING_SUBTEXT_SIZE}px 'Noto Sans', 'DejaVu Sans', Arial, sans-serif`,
    'rgba(255, 255, 255, 0.8)'
  )

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate image blob'))
        }
      },
      'image/png',
      1.0
    )
  })
}

/**
 * Download an image blob with the given filename
 */
export function downloadDoaImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
