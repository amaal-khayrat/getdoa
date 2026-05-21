import { LIST_LIMIT_CONFIG } from '@/lib/list-limit'

/**
 * Smart text truncation with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

interface SearchableHadith {
  matchedReference?: string | null
  book?: string | null
  chapterNumber?: number | null
  chapterTitleArabic?: string | null
  chapterTitleEnglish?: string | null
  arabicText?: string | null
  englishText?: string | null
  grade?: string | null
  referenceUrl?: string | null
  inBookReference?: string | null
}

interface SearchablePrayer {
  slug?: string | null
  nameEn?: string | null
  nameMy?: string | null
  content?: string | null
  meaningEn?: string | null
  meaningMy?: string | null
  referenceEn?: string | null
  referenceMy?: string | null
  descriptionEn?: string | null
  descriptionMy?: string | null
  contextEn?: string | null
  contextMy?: string | null
  categoryNames?: Array<string> | null
  hadithMatches?: Array<SearchableHadith> | null
}

const SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'am',
  'aku',
  'bagi',
  'bila',
  'by',
  'can',
  'could',
  'doa',
  'dua',
  'duaa',
  'du',
  'for',
  'get',
  'give',
  'i',
  'im',
  'in',
  'is',
  'it',
  'ketika',
  'mohon',
  'my',
  'need',
  'of',
  'on',
  'or',
  'please',
  'prayer',
  'rasa',
  'saya',
  'show',
  'supplication',
  'that',
  'the',
  'to',
  'untuk',
  'when',
  'with',
  'yang',
])

const INTENT_GROUPS = [
  {
    triggers: [
      'sedih',
      'sad',
      'sadness',
      'grief',
      'dukacita',
      'duka',
      'sorrow',
      'distress',
      'susah',
      'kesusahan',
      'anxiety',
      'anxious',
      'cemas',
      'risau',
      'worry',
      'worried',
      'stress',
      'depressed',
      'down',
    ],
    terms: [
      'sedih',
      'sad',
      'sadness',
      'grief',
      'dukacita',
      'duka',
      'distress',
      'kesusahan',
      'tenang',
      'calm',
      'lapang',
      'heart',
      'hati',
      'jiwa',
      'soul',
      'worry',
      'cemas',
      'risau',
    ],
  },
  {
    triggers: [
      'takut',
      'fear',
      'afraid',
      'protection',
      'protect',
      'lindung',
      'berlindung',
      'safe',
      'safety',
      'bahaya',
      'harm',
    ],
    terms: [
      'protection',
      'protect',
      'berlindung',
      'lindung',
      'keselamatan',
      'safety',
      'safe',
      'harm',
      'evil',
      'jahat',
    ],
  },
  {
    triggers: [
      'sakit',
      'ill',
      'illness',
      'sick',
      'pain',
      'healing',
      'heal',
      'sembuh',
      'penyakit',
    ],
    terms: [
      'sakit',
      'illness',
      'healing',
      'heal',
      'sembuh',
      'penyakit',
      'afiyah',
      'wellbeing',
    ],
  },
  {
    triggers: [
      'forgive',
      'forgiveness',
      'sin',
      'sins',
      'taubat',
      'ampun',
      'keampunan',
      'repent',
      'repentance',
    ],
    terms: [
      'forgiveness',
      'forgive',
      'keampunan',
      'ampun',
      'taubat',
      'repentance',
      'sins',
      'dosa',
    ],
  },
  {
    triggers: [
      'rezeki',
      'sustenance',
      'wealth',
      'money',
      'income',
      'debt',
      'hutang',
      'rich',
      'cukup',
    ],
    terms: [
      'rezeki',
      'sustenance',
      'wealth',
      'debt',
      'hutang',
      'kekayaan',
      'cukup',
      'income',
    ],
  },
  {
    triggers: [
      'sleep',
      'tidur',
      'wake',
      'waking',
      'bangun',
      'morning',
      'pagi',
      'evening',
      'petang',
      'night',
      'malam',
    ],
    terms: [
      'sleep',
      'tidur',
      'wake',
      'bangun',
      'morning',
      'pagi',
      'evening',
      'petang',
      'night',
      'malam',
    ],
  },
  {
    triggers: [
      'travel',
      'journey',
      'safar',
      'musafir',
      'trip',
      'vehicle',
      'kenderaan',
    ],
    terms: [
      'travel',
      'journey',
      'safar',
      'musafir',
      'trip',
      'vehicle',
      'kenderaan',
    ],
  },
  {
    triggers: [
      'rain',
      'hujan',
      'storm',
      'thunder',
      'petir',
      'wind',
      'angin',
    ],
    terms: ['rain', 'hujan', 'storm', 'thunder', 'petir', 'wind', 'angin'],
  },
  {
    triggers: [
      'guidance',
      'guide',
      'hidayah',
      'decision',
      'choose',
      'choice',
      'istikharah',
      'confused',
      'keliru',
    ],
    terms: [
      'guidance',
      'guide',
      'hidayah',
      'decision',
      'choice',
      'istikharah',
      'wisdom',
      'bijak',
    ],
  },
  {
    triggers: [
      'study',
      'exam',
      'knowledge',
      'learn',
      'ilmu',
      'belajar',
      'faham',
      'understand',
    ],
    terms: [
      'study',
      'exam',
      'knowledge',
      'learn',
      'ilmu',
      'belajar',
      'understand',
      'faham',
    ],
  },
  {
    triggers: [
      'family',
      'children',
      'child',
      'parents',
      'ibu',
      'bapa',
      'anak',
      'keluarga',
      'spouse',
      'pasangan',
    ],
    terms: [
      'family',
      'children',
      'child',
      'parents',
      'ibu',
      'bapa',
      'anak',
      'keluarga',
      'spouse',
      'pasangan',
    ],
  },
  {
    triggers: [
      'thanks',
      'thankful',
      'gratitude',
      'syukur',
      'grateful',
      'nikmat',
    ],
    terms: ['thanks', 'thankful', 'gratitude', 'syukur', 'grateful', 'nikmat'],
  },
]

export function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9\u0600-\u06ff]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function tokenizeSearchQuery(query: string): Array<string> {
  return normalizeSearchText(query)
    .split(' ')
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token))
}

function uniqueTerms(terms: Array<string>): Array<string> {
  return [...new Set(terms.map(normalizeSearchText).filter(Boolean))]
}

function getIntentTerms(tokens: Array<string>): Array<string> {
  if (tokens.length === 0) return []

  return uniqueTerms(
    INTENT_GROUPS.flatMap((group) =>
      group.triggers.some((trigger) => tokens.includes(trigger))
        ? group.terms
        : [],
    ),
  )
}

function joinFields(fields: Array<unknown>): string {
  return normalizeSearchText(fields.filter(Boolean).join(' '))
}

function buildHadithText(
  hadithMatches: Array<SearchableHadith> | null | undefined,
): string {
  return joinFields(
    (hadithMatches ?? []).flatMap((match) => [
      match.matchedReference,
      match.book,
      match.chapterNumber,
      match.chapterTitleArabic,
      match.chapterTitleEnglish,
      match.arabicText,
      match.englishText,
      match.grade,
      match.referenceUrl,
      match.inBookReference,
    ]),
  )
}

export function getSearchableText(prayer: SearchablePrayer): string {
  return joinFields([
    prayer.slug,
    prayer.nameEn,
    prayer.nameMy,
    prayer.content,
    prayer.meaningEn,
    prayer.meaningMy,
    prayer.referenceEn,
    prayer.referenceMy,
    prayer.descriptionEn,
    prayer.descriptionMy,
    prayer.contextEn,
    prayer.contextMy,
    ...(prayer.categoryNames ?? []),
    buildHadithText(prayer.hadithMatches),
  ])
}

function scoreTerm(text: string, term: string, weight: number): number {
  if (!term || !text.includes(term)) return 0
  return weight
}

export function getSearchScore(
  prayer: SearchablePrayer,
  query: string,
): number {
  const normalizedQuery = normalizeSearchText(query)
  const tokens = tokenizeSearchQuery(query)
  const intentTerms = getIntentTerms(tokens)
  const expandedTerms = uniqueTerms([...tokens, ...intentTerms])

  if (!normalizedQuery || expandedTerms.length === 0) {
    return 0
  }

  const titleText = joinFields([prayer.nameEn, prayer.nameMy, prayer.slug])
  const categoryText = joinFields(prayer.categoryNames ?? [])
  const titleTerms = new Set(titleText.split(' ').filter(Boolean))
  const exactCategoryTerms = new Set(
    (prayer.categoryNames ?? []).map(normalizeSearchText).filter(Boolean),
  )
  const meaningText = joinFields([
    prayer.meaningEn,
    prayer.meaningMy,
    prayer.descriptionEn,
    prayer.descriptionMy,
    prayer.contextEn,
    prayer.contextMy,
  ])
  const referenceText = joinFields([prayer.referenceEn, prayer.referenceMy])
  const arabicText = normalizeSearchText(prayer.content)
  const hadithText = buildHadithText(prayer.hadithMatches)
  const allText = joinFields([
    titleText,
    categoryText,
    meaningText,
    referenceText,
    arabicText,
    hadithText,
  ])

  let score = 0

  if (titleText === normalizedQuery) {
    score += 100
  } else if (titleText.includes(normalizedQuery)) {
    score += 70
  } else if (allText.includes(normalizedQuery)) {
    score += 30
  }

  if (tokens.length > 1 && tokens.every((token) => allText.includes(token))) {
    score += 16
  }

  for (const term of tokens) {
    if (titleTerms.has(term)) score += 24
    if (exactCategoryTerms.has(term)) score += 180
    score += scoreTerm(titleText, term, 18)
    score += scoreTerm(categoryText, term, 16)
    score += scoreTerm(meaningText, term, 8)
    score += scoreTerm(hadithText, term, 8)
    score += scoreTerm(referenceText, term, 6)
    score += scoreTerm(arabicText, term, 3)
  }

  for (const term of intentTerms) {
    if (tokens.includes(term)) continue
    score += scoreTerm(titleText, term, 10)
    score += scoreTerm(categoryText, term, 12)
    score += scoreTerm(meaningText, term, 6)
    score += scoreTerm(hadithText, term, 5)
    score += scoreTerm(referenceText, term, 3)
    score += scoreTerm(arabicText, term, 1)
  }

  return score
}

/**
 * Ranked search for prayers, including titles, meanings, categories, references,
 * Arabic text, and supporting hadith metadata/text.
 */
export function searchPrayers<T extends SearchablePrayer>(
  prayers: Array<T>,
  query: string,
): Array<T> {
  const normalizedQuery = normalizeSearchText(query)
  const tokens = tokenizeSearchQuery(query)
  const intentTerms = getIntentTerms(tokens)

  if (!normalizedQuery || tokens.length === 0) return prayers

  return prayers
    .map((prayer, index) => ({
      prayer,
      index,
      score: getSearchScore(prayer, query),
      searchableText: getSearchableText(prayer),
    }))
    .filter((result) => {
      if (result.score <= 0) return false
      if (tokens.length <= 1 || intentTerms.length > 0) return true
      return tokens.every((token) => result.searchableText.includes(token))
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((result) => result.prayer)
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
 * @param list - The list to validate
 * @param maxPrayers - Maximum prayers allowed
 */
export function validateDoaList(
  list: {
    title?: string
    prayers?: Array<{ slug: string }>
  },
  maxPrayers: number = LIST_LIMIT_CONFIG.MAX_PRAYERS_PER_LIST_FREE,
): {
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

  if (list.prayers && list.prayers.length > maxPrayers) {
    errors.push(`Maximum ${maxPrayers} prayers allowed`)
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
