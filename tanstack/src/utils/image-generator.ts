import type { DoaList } from '@/types/doa.types'
import {
  analyzeContent,
  calculateOptimalLayout,
  wrapArabicText
} from '@/utils/text-helpers'
import { preloadSimpoFont } from '@/utils/font-loader'

interface GenerateImageConfig {
  doaList: DoaList
  backgroundColor: string
  textColor: string
  minImageWidth?: number
  maxImageWidth?: number
  targetAspectRatio?: number
}

export async function generateDoaImage(
  config: GenerateImageConfig,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Analyze content to determine optimal dimensions
  const baseWidth = config.minImageWidth || 1080
  const contentAnalysis = analyzeContent(
    config.doaList.prayers,
    config.doaList.showTranslations,
    config.doaList.translationLayout,
    baseWidth
  )

  // Calculate optimal layout dimensions
  const layout = calculateOptimalLayout(
    contentAnalysis,
    config.targetAspectRatio
  )

  // Set canvas size with calculated dimensions
  canvas.width = layout.width
  canvas.height = layout.height

  // Background
  ctx.fillStyle = config.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Ensure the Arabic font is loaded (should be preloaded)
  await preloadSimpoFont()

  // Set up text properties
  ctx.textAlign = 'center'
  ctx.fillStyle = config.textColor

  // Use dynamic font sizes from content analysis
  const { suggestedFontSize } = contentAnalysis

  let currentY = layout.margins.top

  // Attribution at the very top corners - smaller than everything else
  const attributionFontSize = Math.max(suggestedFontSize.description - 6, 10)
  ctx.font = `${attributionFontSize}px Arial, sans-serif`
  ctx.fillStyle = '#888888'

  // Left attribution - at very top
  ctx.textAlign = 'left'
  if (config.doaList.createdBy) {
    ctx.fillText(`Created by: ${config.doaList.createdBy}`, layout.margins.left, currentY)
  }

  // Right attribution - at very top
  ctx.textAlign = 'right'
  ctx.fillText('Create your own prayer list at GetDoa.com →', canvas.width - layout.margins.right, currentY)

  ctx.fillStyle = config.textColor
  ctx.textAlign = 'center'
  currentY += 40

  // Title at the top center
  if (config.doaList.title) {
    ctx.font = `bold ${suggestedFontSize.title + 4}px Arial, sans-serif`
    ctx.fillText(config.doaList.title, canvas.width / 2, currentY)
    currentY += 60
  }

  // Bismillah
  ctx.font = `bold ${suggestedFontSize.arabic + 6}px Simpo, Arial, sans-serif`
  ctx.fillText('بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', canvas.width / 2, currentY)
  currentY += 60

  // Description if exists
  if (config.doaList.description) {
    ctx.font = `${suggestedFontSize.description}px Arial, sans-serif`
    ctx.fillStyle = '#666666'
    ctx.fillText(config.doaList.description, canvas.width / 2, currentY)
    ctx.fillStyle = config.textColor
    currentY += layout.spacing.descriptionToContent
  } else {
    currentY += layout.spacing.descriptionToContent
  }

  // Draw prayers

  config.doaList.prayers.forEach((prayer) => {
    // Arabic text - RTL with dynamic font size and improved wrapping
    ctx.font = `${suggestedFontSize.arabic}px Simpo, Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'

    const maxWidth = canvas.width - (layout.margins.left + layout.margins.right)
    const arabicLines = wrapArabicText(prayer.content, maxWidth, suggestedFontSize.arabic, ctx)

    // Draw each Arabic line centered
    arabicLines.forEach((line, lineIndex) => {
      ctx.fillText(line, canvas.width / 2, currentY + (lineIndex * suggestedFontSize.arabic * 1.6))
    })

    currentY += arabicLines.length * suggestedFontSize.arabic * 1.6

    // Handle translations based on layout
    if (config.doaList.showTranslations) {
      const translation =
        config.doaList.language === 'my' ? prayer.meaning_my : prayer.meaning_en

      if (config.doaList.translationLayout === 'interleaved') {
        // Translation immediately after prayer
        currentY += layout.spacing.translationSpacing
        ctx.font = `${suggestedFontSize.translations}px Arial, sans-serif`
        ctx.fillStyle = '#666666'
        ctx.textAlign = 'center'
        ctx.direction = 'ltr'

        // Word wrap for translations with proper line breaking
        const transWords = translation.split(' ')
        let transLine = ''
        let transY = currentY
        const translationLines: string[] = []

        for (let i = 0; i < transWords.length; i++) {
          const testLine = transLine ? `${transLine} ${transWords[i]}` : transWords[i]
          const metrics = ctx.measureText(testLine)

          if (metrics.width > maxWidth && transLine) {
            translationLines.push(transLine)
            transLine = transWords[i]
          } else {
            transLine = testLine
          }
        }
        if (transLine) {
          translationLines.push(transLine)
        }

        // Draw each translation line centered
        translationLines.forEach((line, lineIndex) => {
          ctx.fillText(line, canvas.width / 2, transY + (lineIndex * suggestedFontSize.translations * 1.5))
        })

        currentY += translationLines.length * suggestedFontSize.translations * 1.5
        ctx.fillStyle = config.textColor
      }
    }

    currentY += layout.spacing.prayerSpacing
  })

  // Grouped translations at the end
  if (
    config.doaList.showTranslations &&
    config.doaList.translationLayout === 'grouped'
  ) {
    currentY += 40
    ctx.font = `bold ${suggestedFontSize.title}px Arial, sans-serif`
    ctx.fillText('Translations', canvas.width / 2, currentY)
    currentY += 40

    ctx.font = `${suggestedFontSize.translations}px Arial, sans-serif`
    ctx.fillStyle = '#666666'
    ctx.textAlign = 'center'
    ctx.direction = 'ltr'

    config.doaList.prayers.forEach((prayer, index) => {
      const translation =
        config.doaList.language === 'my' ? prayer.meaning_my : prayer.meaning_en

      // Smart word wrap for grouped translations
      const maxWidth = canvas.width - (layout.margins.left + layout.margins.right)
      const words = translation.split(' ')
      let line = ''
      let lineY = currentY
      const translationLines: string[] = []

      for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i]
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && line) {
          translationLines.push(line)
          line = words[i]
        } else {
          line = testLine
        }
      }
      if (line) {
        translationLines.push(line)
      }

      // Draw each translation line centered
      translationLines.forEach((transLine, lineIndex) => {
        ctx.fillText(transLine, canvas.width / 2, lineY + (lineIndex * suggestedFontSize.translations * 1.5))
      })

      currentY += translationLines.length * suggestedFontSize.translations * 1.5 + 30
    })
  }

  // Footer with "Ameen"
  const footerY = canvas.height - layout.margins.bottom
  ctx.font = `bold ${suggestedFontSize.arabic + 6}px Simpo, Arial, sans-serif`
  ctx.fillStyle = config.textColor
  ctx.textAlign = 'center'
  ctx.fillText('أٰمِيْنَ', canvas.width / 2, footerY)

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
      1.0,
    )
  })
}

export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
