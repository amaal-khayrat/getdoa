/**
 * Smart text truncation with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Simple search function for filtering prayers
 */
export function searchPrayers(prayers: Array<any>, query: string): Array<any> {
  if (!query.trim()) return prayers

  const searchTerm = query.toLowerCase()

  return prayers.filter((prayer) => {
    return (
      prayer.nameEn?.toLowerCase().includes(searchTerm) ||
      prayer.nameMy?.toLowerCase().includes(searchTerm) ||
      prayer.content?.toLowerCase().includes(searchTerm) ||
      prayer.meaningEn?.toLowerCase().includes(searchTerm) ||
      prayer.meaningMy?.toLowerCase().includes(searchTerm) ||
      prayer.referenceEn?.toLowerCase().includes(searchTerm) ||
      prayer.referenceMy?.toLowerCase().includes(searchTerm)
    )
  })
}

/**
 * Filter prayers by category
 */
export function filterByCategory(
  prayers: Array<any>,
  category: string,
): Array<any> {
  if (!category || category === 'All Categories') return prayers

  return prayers.filter((prayer) => prayer.categoryNames?.includes(category))
}

/**
 * Check if prayer is already selected
 */
export function isPrayerSelected(
  prayers: Array<any>,
  prayerSlug: string,
): boolean {
  return prayers.some((p) => p.slug === prayerSlug)
}

/**
 * Validate the doa list
 */
export function validateDoaList(list: {
  title?: string
  prayers?: Array<any>
}): {
  isValid: boolean
  errors: Array<string>
} {
  const errors: Array<string> = []

  if (!list.title || list.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (list.title && list.title.length > 100) {
    errors.push('Title must be under 100 characters')
  }

  if (!list.prayers || list.prayers.length === 0) {
    errors.push('Please select at least one prayer')
  }

  if (list.prayers && list.prayers.length > 15) {
    errors.push('Maximum 15 prayers allowed')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Content analysis interfaces
export interface TextMetrics {
  width: number
  height: number
  lineCount: number
  recommendedFontSize: number
}

export interface ContentAnalysis {
  totalArabicHeight: number
  totalTranslationHeight: number
  maxHeightLine: number
  recommendedWidth: number
  recommendedHeight: number
  suggestedFontSize: {
    arabic: number
    translations: number
    title: number
    description: number
  }
}

export interface FontSizeConfig {
  minArabic: number
  maxArabic: number
  minTranslation: number
  maxTranslation: number
  scaleFactor: number
}

export interface LayoutDimensions {
  width: number
  height: number
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  spacing: {
    titleToDescription: number
    descriptionToContent: number
    prayerSpacing: number
    translationSpacing: number
  }
}

/**
 * Calculate optimal font sizes based on content length and prayer count
 */
export function calculateOptimalFontSizes(
  contentLength: number,
  prayerCount: number,
  _targetWidth: number,
): FontSizeConfig {
  // Base configuration for readability
  const config: FontSizeConfig = {
    minArabic: Math.floor(28 * 1.3), // Minimum readable Arabic font (1.3x larger)
    maxArabic: Math.floor(36 * 1.3), // Maximum Arabic font for short content (1.3x larger)
    minTranslation: 18, // Minimum translation font
    maxTranslation: 24, // Maximum translation font
    scaleFactor: 0.8, // How aggressively to scale based on content
  }

  // Adjust font sizes based on content length
  const contentRatio = Math.min(contentLength / 2000, 1) // Normalize to 0-1 range
  const prayerRatio = Math.min(prayerCount / 10, 1) // Normalize prayer count

  // Combined ratio to determine font scaling
  const combinedRatio =
    (contentRatio * 0.6 + prayerRatio * 0.4) * config.scaleFactor

  // Calculate optimal sizes
  const arabicSize =
    config.maxArabic - (config.maxArabic - config.minArabic) * combinedRatio
  const translationSize =
    config.maxTranslation -
    (config.maxTranslation - config.minTranslation) * combinedRatio

  return {
    ...config,
    // We'll use these calculated sizes, keeping the config for reference
    minArabic: arabicSize,
    maxArabic: arabicSize,
    minTranslation: translationSize,
    maxTranslation: translationSize,
  }
}

/**
 * Analyze content and calculate required dimensions
 */
export function analyzeContent(
  prayers: Array<any>,
  showTranslations: boolean,
  translationLayout: 'grouped' | 'interleaved',
  baseWidth: number,
): ContentAnalysis {
  // Calculate optimal font sizes first
  const totalContentLength = prayers.reduce((sum, prayer) => {
    return (
      sum +
      (prayer.content?.length || 0) +
      (showTranslations
        ? (prayer.meaningEn?.length || 0) + (prayer.meaningMy?.length || 0)
        : 0)
    )
  }, 0)

  const fontConfig = calculateOptimalFontSizes(
    totalContentLength,
    prayers.length,
    baseWidth,
  )

  // Calculate text dimensions
  let totalArabicHeight = 0
  let totalTranslationHeight = 0
  let maxHeightLine = 0

  prayers.forEach((prayer) => {
    // Arabic text calculation
    const arabicText = prayer.content || ''
    const arabicWords = arabicText.split(' ')
    const arabicLinesPerPrayer = Math.ceil(arabicWords.length / 8) // Average 8 words per line
    const arabicHeight = arabicLinesPerPrayer * (fontConfig.minArabic * 1.6) // 1.6 line height
    totalArabicHeight += arabicHeight

    // Translation text calculation
    if (showTranslations) {
      const translationText = prayer.meaningEn || prayer.meaningMy || ''
      const translationWords = translationText.split(' ')
      const translationLinesPerPrayer = Math.ceil(translationWords.length / 12) // Average 12 words per line
      const translationHeight =
        translationLinesPerPrayer * (fontConfig.minTranslation * 1.5) // 1.5 line height

      if (translationLayout === 'interleaved') {
        totalTranslationHeight += translationHeight
      } else {
        // For grouped layout, we'll add a section header
        totalTranslationHeight += translationHeight + 20 // Extra spacing for grouped layout
      }
    }

    // Track max line height
    maxHeightLine = Math.max(maxHeightLine, fontConfig.minArabic * 1.6)
  })

  // Calculate total height requirements
  let contentHeight = 0

  // Title space
  if (prayers.length > 0) {
    contentHeight += 40 // Title space
  }

  // Attribution space
  contentHeight += 30 // Attribution space

  // Bismillah space
  contentHeight += 60 // Bismillah space

  // Description space if needed
  const hasDescription = prayers.some(
    (p) => p.descriptionEn || p.descriptionMy,
  )
  if (hasDescription) {
    contentHeight += 40 // Description space
  }

  // Content to Bismillah spacing
  contentHeight += 40

  // Arabic content height
  contentHeight += totalArabicHeight
  contentHeight += (prayers.length - 1) * 40 // Prayer spacing

  // Translation height
  if (showTranslations && translationLayout === 'interleaved') {
    contentHeight += totalTranslationHeight
  }

  // Grouped translations section height
  if (showTranslations && translationLayout === 'grouped') {
    contentHeight += 40 // Section header
    contentHeight += totalTranslationHeight
  }

  // Footer space (Ameen + spacing)
  contentHeight += 100 // Ameen + more spacing

  // Calculate recommended dimensions
  const margins = { top: 60, right: 80, bottom: 60, left: 80 }
  const recommendedWidth = Math.max(baseWidth, 1080) // Minimum 1080px width
  const recommendedHeight = Math.ceil(
    contentHeight + margins.top + margins.bottom,
  )

  return {
    totalArabicHeight,
    totalTranslationHeight,
    maxHeightLine,
    recommendedWidth,
    recommendedHeight,
    suggestedFontSize: {
      arabic: fontConfig.minArabic,
      translations: fontConfig.minTranslation,
      title: 28,
      description: 18,
    },
  }
}

/**
 * Calculate optimal layout dimensions based on content analysis
 */
export function calculateOptimalLayout(
  contentAnalysis: ContentAnalysis,
  targetAspectRatio?: number,
): LayoutDimensions {
  const { recommendedWidth, recommendedHeight } = contentAnalysis

  // Define base margins and spacing
  const margins = {
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  }

  const spacing = {
    titleToDescription: 20,
    descriptionToContent: 40,
    prayerSpacing: 40,
    translationSpacing: 25,
  }

  // Adjust for aspect ratio if specified
  let finalWidth = recommendedWidth
  let finalHeight = recommendedHeight

  if (targetAspectRatio) {
    const currentRatio = recommendedWidth / recommendedHeight
    if (currentRatio < targetAspectRatio) {
      // Need wider image
      finalWidth = Math.ceil(recommendedHeight * targetAspectRatio)
    } else {
      // Need taller image
      finalHeight = Math.ceil(recommendedWidth / targetAspectRatio)
    }
  }

  return {
    width: finalWidth,
    height: finalHeight,
    margins,
    spacing,
  }
}

/**
 * Smart Arabic text wrapping that respects word boundaries
 */
export function wrapArabicText(
  text: string,
  maxWidth: number,
  fontSize: number,
  ctx?: CanvasRenderingContext2D,
): Array<string> {
  // If no canvas context provided, estimate using character count
  if (!ctx) {
    const avgCharWidth = fontSize * 0.6 // Estimate for Arabic characters
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth)
    const words = text.split(' ')
    const lines: Array<string> = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word

      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines.length > 0 ? lines : [text]
  }

  // Use canvas context for accurate measurement - Use Simpo as primary font
  ctx.font = `${fontSize}px 'Simpo', 'Amiri Quran', 'Scheherazade New', Arial, sans-serif`
  ctx.textAlign = 'right'
  ctx.direction = 'rtl'

  const words = text.split(' ')
  const lines: Array<string> = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : [text]
}

/**
 * Render centered Arabic text with proper RTL alignment
 * Fixes the issue where Arabic text starts from center and overflows right
 */
export function renderCenteredArabicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  fontSize: number,
): void {
  // Set proper Arabic text configuration - Use Simpo as primary font
  ctx.font = `${fontSize}px 'Simpo', 'Amiri Quran', 'Scheherazade New', Arial, sans-serif`
  ctx.textAlign = 'right'
  ctx.direction = 'rtl'

  // Get wrapped lines for the text
  const lines = wrapArabicText(text, maxWidth, fontSize, ctx)

  // Render each line with proper centering
  lines.forEach((line, index) => {
    const lineY = y + (index * fontSize * 1.6)

    // Calculate line metrics for proper centering
    const lineMetrics = ctx.measureText(line)
    const lineWidth = lineMetrics.width

    // For right-aligned RTL text, center means: centerX + (lineWidth / 2)
    const renderX = centerX + (lineWidth / 2)

    ctx.fillText(line, renderX, lineY)
  })
}

/**
 * Calculate center position for right-aligned RTL text
 */
export function calculateArabicCenterPosition(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  fontSize: number,
): number {
  // Set font for measurement - Use Simpo as primary font
  ctx.font = `${fontSize}px 'Simpo', 'Amiri Quran', 'Scheherazade New', Arial, sans-serif`

  // Measure text width
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width

  // For right-aligned RTL text: centerX + (textWidth / 2)
  return centerX + (textWidth / 2)
}
