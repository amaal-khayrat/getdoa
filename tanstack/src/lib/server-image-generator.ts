import sharp from 'sharp'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { db } from '@/db'
import { doa } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Doa, Language } from '@/types/doa.types'

interface GenerateDoaImageConfig {
  doa: Doa
  backgroundId: number
  language: Language
}

// Background image dimensions
const BG_WIDTH = 1728
const BG_HEIGHT = 2304

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Wrap text into lines for SVG rendering
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

// Wrap Arabic text (shorter lines due to larger characters)
function wrapArabicText(text: string, maxChars: number = 45): string[] {
  return wrapText(text, maxChars)
}

// Wrap translation text
function wrapTranslationText(text: string, maxChars: number = 70): string[] {
  return wrapText(text, maxChars)
}

// Render multiline text as SVG text elements
function renderMultilineText(
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
  className: string,
): string {
  return lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${startY + i * lineHeight}" class="${className}">${escapeXml(line)}</text>`,
    )
    .join('\n')
}

// Create SVG with text overlay
function createTextOverlaySvg(config: {
  arabicText: string
  translation: string
  doaName: string
  fontBase64: string
  width: number
  height: number
}): string {
  const { arabicText, translation, doaName, fontBase64, width, height } = config

  // Wrap text for proper display
  const wrappedArabic = wrapArabicText(arabicText, 50)
  const wrappedTranslation = wrapTranslationText(translation, 65)

  // Calculate positions
  const doaNameY = 180
  const arabicStartY = 380
  const arabicLineHeight = 179
  const arabicEndY = arabicStartY + wrappedArabic.length * arabicLineHeight

  // Translation starts after Arabic with some spacing
  const translationStartY = Math.min(arabicEndY + 150, height - 500)
  const translationLineHeight = 63

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: 'Simpo';
            src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
          }
          .arabic-text {
            font-family: 'Simpo', 'Traditional Arabic', 'Scheherazade New', serif;
            font-size: 99px;
            fill: white;
            text-anchor: middle;
            direction: rtl;
            text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
          }
          .doa-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 48px;
            fill: white;
            text-anchor: middle;
            font-weight: bold;
            text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
          }
          .translation {
            font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
            font-size: 45px;
            fill: rgba(255, 255, 255, 0.95);
            text-anchor: middle;
            text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
          }
        </style>
      </defs>

      <!-- Doa Name -->
      <text x="${width / 2}" y="${doaNameY}" class="doa-name">${escapeXml(doaName)}</text>

      <!-- Arabic Text (centered) -->
      ${renderMultilineText(wrappedArabic, width / 2, arabicStartY, arabicLineHeight, 'arabic-text')}

      <!-- Translation -->
      ${renderMultilineText(wrappedTranslation, width / 2, translationStartY, translationLineHeight, 'translation')}
    </svg>
  `
}

// Create branding overlay SVG
function createBrandingOverlaySvg(config: {
  logoSvgContent: string
  width: number
  height: number
}): string {
  const { width, height } = config
  const bottomMargin = 80

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .branding-text {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 36px;
            fill: white;
            text-anchor: middle;
            font-weight: 600;
            text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
          }
          .branding-subtext {
            font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
            font-size: 24px;
            fill: rgba(255, 255, 255, 0.8);
            text-anchor: middle;
            text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
          }
        </style>
      </defs>

      <!-- GetDoa branding at bottom -->
      <text x="${width / 2}" y="${height - bottomMargin - 40}" class="branding-text">GetDoa</text>
      <text x="${width / 2}" y="${height - bottomMargin}" class="branding-subtext">getdoa.com</text>
    </svg>
  `
}

export async function generateDoaImageWithSharp(
  config: GenerateDoaImageConfig,
): Promise<Buffer> {
  const { doa: doaData, backgroundId, language } = config

  // 1. Load background image
  const bgPath = path.join(
    process.cwd(),
    'src',
    'assets',
    'ai',
    `${backgroundId}.jpeg`,
  )
  const bgBuffer = await fs.readFile(bgPath)

  // 2. Load font for Arabic text
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'simpo.ttf')
  let fontBase64 = ''
  try {
    const fontBuffer = await fs.readFile(fontPath)
    fontBase64 = fontBuffer.toString('base64')
  } catch {
    // Font not found, will use fallback fonts in SVG
    console.warn('Simpo font not found, using fallback fonts')
  }

  // 3. Load logo SVG (for potential future use)
  const logoPath = path.join(process.cwd(), 'public', 'logo.svg')
  let logoSvgContent = ''
  try {
    logoSvgContent = await fs.readFile(logoPath, 'utf-8')
  } catch {
    console.warn('Logo not found')
  }

  // 4. Get translation based on language
  const translation = language === 'my' ? doaData.meaningMy : doaData.meaningEn
  const doaName = language === 'my' ? doaData.nameMy : doaData.nameEn

  // 5. Create SVG overlays
  const textOverlaySvg = createTextOverlaySvg({
    arabicText: doaData.content,
    translation: translation || '',
    doaName,
    fontBase64,
    width: BG_WIDTH,
    height: BG_HEIGHT,
  })

  const brandingOverlaySvg = createBrandingOverlaySvg({
    logoSvgContent,
    width: BG_WIDTH,
    height: BG_HEIGHT,
  })

  // 6. Create semi-transparent overlay for better text readability
  const darkOverlay = await sharp({
    create: {
      width: BG_WIDTH,
      height: BG_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0.45 },
    },
  })
    .png()
    .toBuffer()

  // 7. Convert SVGs to buffers
  const textOverlayBuffer = Buffer.from(textOverlaySvg)
  const brandingOverlayBuffer = Buffer.from(brandingOverlaySvg)

  // 8. Composite all layers using Sharp
  const result = await sharp(bgBuffer)
    .resize(BG_WIDTH, BG_HEIGHT, { fit: 'cover' })
    .composite([
      // Dark overlay for contrast
      {
        input: darkOverlay,
        top: 0,
        left: 0,
        blend: 'over',
      },
      // Text overlay
      {
        input: textOverlayBuffer,
        top: 0,
        left: 0,
      },
      // Branding overlay
      {
        input: brandingOverlayBuffer,
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 90 })
    .toBuffer()

  return result
}

// Helper to load doa data by slug (server-side)
export async function loadDoaBySlug(slug: string): Promise<Doa | null> {
  const result = await db.query.doa.findFirst({
    where: eq(doa.slug, slug),
  })

  return result ?? null
}
