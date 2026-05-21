import { describe, expect, it } from 'vitest'
import {
  getSearchScore,
  normalizeSearchText,
  searchPrayers,
} from './text-helpers'

const prayers = [
  {
    slug: 'doa-kelapangan-hati-dan-jiwa',
    nameEn: 'Prayer for Relief of the Heart and Soul',
    nameMy: 'Doa Kelapangan Hati dan Jiwa',
    content: 'اللهم اجعل القرآن ربيع قلبي',
    meaningEn: 'Make the Quran the spring of my heart and banisher of sadness.',
    meaningMy: 'Jadikan al-Quran penawar kesedihan dan kelapangan hati.',
    referenceEn: 'Ahmad',
    referenceMy: 'Ahmad',
    descriptionEn: 'For distress, worry, grief, and sadness.',
    descriptionMy: 'Untuk kesedihan, kerisauan, dan dukacita.',
    contextEn: null,
    contextMy: null,
    categoryNames: ['Tenang', 'Hati', 'Jiwa', 'Calm', 'Heart', 'Soul'],
    hadithMatches: [
      {
        matchedReference: 'Ahmad 3712',
        book: 'Musnad Ahmad',
        chapterNumber: 1,
        chapterTitleArabic: null,
        chapterTitleEnglish: 'Supplications',
        arabicText: null,
        englishText: 'O Allah, make the Quran the banisher of my sadness.',
        grade: 'Hasan',
        referenceUrl: 'https://example.com/ahmad-3712',
        inBookReference: 'Book 1, Hadith 3712',
      },
    ],
  },
  {
    slug: 'doa-berlindung-dari-dukacita',
    nameEn: 'Prayer for Protection from Grief',
    nameMy: 'Doa Berlindung daripada Dukacita',
    content: 'اللهم إني أعوذ بك من الهم والحزن',
    meaningEn: 'I seek refuge in You from worry and grief.',
    meaningMy: 'Aku berlindung dengan-Mu daripada kerisauan dan kesedihan.',
    referenceEn: 'Bukhari',
    referenceMy: 'Bukhari',
    descriptionEn: null,
    descriptionMy: null,
    contextEn: null,
    contextMy: null,
    categoryNames: ['Keselamatan', 'Perlindungan', 'Sedih', 'Grief'],
    hadithMatches: [
      {
        matchedReference: 'Sahih al-Bukhari 6369',
        book: 'Sahih al-Bukhari',
        chapterNumber: 80,
        chapterTitleArabic: null,
        chapterTitleEnglish: 'Invocations',
        arabicText: null,
        englishText: 'The Prophet used to seek refuge from grief and sadness.',
        grade: 'Sahih',
        referenceUrl: 'https://example.com/bukhari-6369',
        inBookReference: 'Book 80, Hadith 66',
      },
    ],
  },
  {
    slug: 'doa-ketika-hujan',
    nameEn: 'Prayer When It Rains',
    nameMy: 'Doa Ketika Hujan',
    content: 'اللهم صيبا نافعا',
    meaningEn: 'O Allah, make it beneficial rain.',
    meaningMy: 'Ya Allah, jadikan hujan ini bermanfaat.',
    referenceEn: 'Bukhari',
    referenceMy: 'Bukhari',
    descriptionEn: null,
    descriptionMy: null,
    contextEn: null,
    contextMy: null,
    categoryNames: ['Rain', 'Hujan'],
    hadithMatches: [
      {
        matchedReference: 'Sahih al-Bukhari 1032',
        book: 'Sahih al-Bukhari',
        chapterNumber: 15,
        chapterTitleArabic: null,
        chapterTitleEnglish: 'Rain',
        arabicText: null,
        englishText: 'A supplication for beneficial rain.',
        grade: 'Sahih',
        referenceUrl: 'https://example.com/bukhari-1032',
        inBookReference: 'Book 15, Hadith 28',
      },
    ],
  },
]

describe('searchPrayers', () => {
  it('returns the original list for empty or only helper-word queries', () => {
    expect(searchPrayers(prayers, '')).toBe(prayers)
    expect(searchPrayers(prayers, 'doa ketika')).toBe(prayers)
  })

  it('normalizes punctuation, apostrophes, and casing', () => {
    expect(normalizeSearchText("Doa when I'm SAD!!")).toBe(
      'doa when im sad',
    )
  })

  it('ranks natural English sadness searches above unrelated prayers', () => {
    const results = searchPrayers(prayers, 'doa when i am sad')

    expect(results.map((prayer) => prayer.slug)).toEqual([
      'doa-kelapangan-hati-dan-jiwa',
      'doa-berlindung-dari-dukacita',
    ])
  })

  it('ranks natural Malay sadness searches above unrelated prayers', () => {
    const results = searchPrayers(prayers, 'doa ketika sedih')

    expect(results.map((prayer) => prayer.slug)).toEqual([
      'doa-berlindung-dari-dukacita',
      'doa-kelapangan-hati-dan-jiwa',
    ])
  })

  it('searches hadith references and source text', () => {
    expect(searchPrayers(prayers, 'bukhari 1032')).toHaveLength(1)
    expect(searchPrayers(prayers, 'bukhari 1032')[0]?.slug).toBe(
      'doa-ketika-hujan',
    )

    expect(searchPrayers(prayers, 'banisher sadness')[0]?.slug).toBe(
      'doa-kelapangan-hati-dan-jiwa',
    )
  })

  it('exposes comparable scores for recommendation ordering', () => {
    const sadScore = getSearchScore(prayers[0], 'doa when i am sad')
    const rainScore = getSearchScore(prayers[2], 'doa when i am sad')

    expect(sadScore).toBeGreaterThan(rainScore)
  })
})
