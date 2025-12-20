import type { DoaList, ImageDimensions } from '@/types/doa.types'
import { IMAGE_SIZE_PRESETS } from '@/types/doa.types'

interface GenerateImageConfig {
  doaList: DoaList
  imageSize: ImageDimensions
  backgroundColor: string
  textColor: string
}

export async function generateDoaImage(
  config: GenerateImageConfig,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Set canvas size
  canvas.width = config.imageSize.width
  canvas.height = config.imageSize.height

  // Background
  ctx.fillStyle = config.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Try to load the Arabic font
  try {
    const fontResponse = await fetch('/fonts/simpo.ttf')
    if (fontResponse.ok) {
      const fontBuffer = await fontResponse.arrayBuffer()
      const fontFace = new FontFace('Simpo', fontBuffer)
      await fontFace.load()
      document.fonts.add(fontFace)
    }
  } catch (error) {
    console.warn('Could not load Simpo font, using default Arabic font')
  }

  // Set up text properties
  ctx.textAlign = 'center'
  ctx.fillStyle = config.textColor

  // Title: Bismillah
  ctx.font = 'bold 42px Simpo, Arial, sans-serif'
  ctx.fillText('بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', canvas.width / 2, 120)

  // Prayer list title if exists
  if (config.doaList.title) {
    ctx.font = 'bold 28px Arial, sans-serif'
    ctx.fillText(config.doaList.title, canvas.width / 2, 180)
  }

  // Description if exists
  if (config.doaList.description) {
    ctx.font = '18px Arial, sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(config.doaList.description, canvas.width / 2, 220)
    ctx.fillStyle = config.textColor
  }

  // Draw prayers
  let yPosition = 280
  const maxRightPosition = canvas.width - 80
  const leftPosition = 80

  config.doaList.prayers.forEach((prayer, index) => {
    // Prayer number
    ctx.font = '16px Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${index + 1}.`, leftPosition, yPosition)

    // Arabic text - RTL
    ctx.font = '24px Simpo, Arial, sans-serif'
    ctx.textAlign = 'right'

    // Word wrap for long Arabic text
    const maxWidth = canvas.width - 200
    const words = prayer.content.split(' ')
    let line = ''
    let lineY = yPosition

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, maxRightPosition, lineY)
        line = words[i] + ' '
        lineY += 35
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, maxRightPosition, lineY)
    yPosition = lineY + 50

    // Handle translations based on layout
    if (config.doaList.showTranslations) {
      const translation =
        config.doaList.language === 'my' ? prayer.meaning_my : prayer.meaning_en

      if (config.doaList.translationLayout === 'interleaved') {
        // Translation immediately after prayer
        ctx.font = '16px Arial, sans-serif'
        ctx.fillStyle = '#666666'
        ctx.textAlign = 'right'

        // Word wrap for translations
        const transWords = translation.split(' ')
        let transLine = ''
        let transY = yPosition

        for (let i = 0; i < transWords.length; i++) {
          const testLine = transLine + transWords[i] + ' '
          const metrics = ctx.measureText(testLine)
          const testWidth = metrics.width

          if (testWidth > maxWidth && i > 0) {
            ctx.fillText(transLine, maxRightPosition, transY)
            transLine = transWords[i] + ' '
            transY += 25
          } else {
            transLine = testLine
          }
        }
        ctx.fillText(transLine, maxRightPosition, transY)
        yPosition = transY + 40
        ctx.fillStyle = config.textColor
      }
    }
  })

  // Grouped translations at the end
  if (
    config.doaList.showTranslations &&
    config.doaList.translationLayout === 'grouped'
  ) {
    yPosition += 40
    ctx.font = 'bold 20px Arial, sans-serif'
    ctx.fillText('Translations', canvas.width / 2, yPosition)
    yPosition += 40

    ctx.font = '16px Arial, sans-serif'
    ctx.fillStyle = '#666666'
    ctx.textAlign = 'right'

    config.doaList.prayers.forEach((prayer, index) => {
      const translation =
        config.doaList.language === 'my' ? prayer.meaning_my : prayer.meaning_en

      // Word wrap
      const maxWidth = canvas.width - 200
      const words = translation.split(' ')
      let line = ''
      let lineY = yPosition

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(`${index + 1}. ${line}`, maxRightPosition, lineY)
          line = words[i] + ' '
          lineY += 25
        } else {
          line = testLine
        }
      }
      ctx.fillText(`${index + 1}. ${line}`, maxRightPosition, lineY)
      yPosition = lineY + 30
    })
  }

  // Footer with "Ameen"
  const footerY = canvas.height - 120
  ctx.font = 'bold 42px Simpo, Arial, sans-serif'
  ctx.fillStyle = config.textColor
  ctx.textAlign = 'center'
  ctx.fillText('أٰمِيْنَ', canvas.width / 2, footerY)

  // Attribution
  ctx.font = '14px Arial, sans-serif'
  ctx.fillStyle = '#888888'
  const attributionLines = []

  if (config.doaList.createdBy) {
    attributionLines.push(`List Created By: ${config.doaList.createdBy}`)
  }
  attributionLines.push('List Created on GetDoa.com, go create yours now')

  attributionLines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, footerY + 40 + index * 25)
  })

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
