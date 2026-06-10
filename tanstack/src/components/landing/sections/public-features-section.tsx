import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  ShieldCheck,
  Languages,
  Bookmark,
  Share2,
  ChevronRight,
} from 'lucide-react'

const FEATURES = [
  {
    Icon: BookOpen,
    title: 'Discover shared duas',
    description:
      'Explore a curated collection of prayers shared by the community for daily inspiration.',
    cta: 'Explore lists',
    to: '/lists' as const,
  },
  {
    Icon: ShieldCheck,
    title: 'Trusted references',
    description:
      'Every dua is backed by authentic hadith references — recite with confidence.',
    cta: 'Browse the library',
    to: '/doa' as const,
  },
  {
    Icon: Languages,
    title: 'Read in your language',
    description:
      'Arabic, Rumi transliteration, and Malay — whichever feels closest to you.',
    cta: 'See how it works',
    to: '/doa' as const,
  },
]

const SLIDES = [
  {
    title: 'Morning Adhkar',
    arabicText: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا',
    categories: ['Morning Supplication', 'Azkar'],
    meaning:
      'O Allah, by Your grace we have reached the morning and by Your grace we reach the evening.',
    reference: 'Abu Dawud · Sunan Abu Dawud',
  },
  {
    title: 'Evening Protection',
    arabicText:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
    categories: ['Evening Supplication'],
    meaning:
      'In the name of Allah, with whose name nothing in the earth or the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
    reference: 'Abu Dawud · Hadith 4/323',
  },
  {
    title: 'Seeking Forgiveness',
    arabicText:
      'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    categories: ['Daily Supplication', 'Istighfar'],
    meaning:
      'I seek forgiveness from Allah the Almighty, there is no deity except Him, the Ever-Living, the Sustainer of all.',
    reference: 'Bukhari · Sahih al-Bukhari 6306',
  },
]

const AMBER_TILE: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: 'rgba(245,158,11,0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: 2,
}

export function PublicFeaturesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % SLIDES.length),
      5000,
    )
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[currentIndex]

  return (
    <section
      id="features"
      style={{ backgroundColor: '#fdfcf8', padding: '88px 48px' }}
    >
      <div
        className="flex flex-col lg:flex-row items-center max-w-7xl mx-auto"
        style={{ gap: 80 }}
      >
        {/* ── Left column ──────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Eyebrow */}
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: '#0f5f50',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Free for everyone
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 40,
              fontWeight: 400,
              color: '#0a1f18',
              lineHeight: 1.15,
              margin: '0 0 16px',
            }}
          >
            Tools to begin your{' '}
            <em style={{ fontStyle: 'italic', color: '#1e8a74' }}>
              doa practice.
            </em>
          </h2>

          {/* Subtext */}
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: 17,
              fontStyle: 'italic',
              color: '#5F5E5A',
              lineHeight: 1.8,
              margin: '0 0 40px',
            }}
          >
            Essential tools accessible to everyone, designed to begin your
            spiritual journey with ease.
          </p>

          {/* Feature list */}
          <div>
            {FEATURES.map(({ Icon, title, description, cta, to }, index) => (
              <div key={index}>
                {index > 0 && (
                  <div
                    style={{ height: 0.5, backgroundColor: '#ece8de' }}
                    aria-hidden
                  />
                )}
                <div
                  style={{
                    padding: '20px 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  {/* Amber icon tile */}
                  <div style={AMBER_TILE}>
                    <Icon size={18} color="#d97706" strokeWidth={1.75} />
                  </div>

                  {/* Text block */}
                  <div>
                    <div
                      style={{
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#153830',
                        marginBottom: 5,
                      }}
                    >
                      {title}
                    </div>
                    <p
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: 15,
                        fontStyle: 'italic',
                        color: '#5F5E5A',
                        lineHeight: 1.7,
                        margin: '0 0 8px',
                      }}
                    >
                      {description}
                    </p>
                    <Link
                      to={to}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#1e8a74',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        textDecoration: 'none',
                      }}
                    >
                      {cta}
                      <ChevronRight size={13} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column — Doa card ───────────────────────────── */}
        <div
          className="order-first lg:order-last"
          style={{ flexShrink: 0, position: 'relative', width: 600 }}
        >
          {/* Radial teal glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              top: '50%',
              right: -80,
              transform: 'translateY(-50%)',
              background:
                'radial-gradient(circle, rgba(30,138,116,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Main card — /doa style */}
          <div
            style={{
              width: 600,
              height: 500,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '10px 15px 24px 2px rgba(21,90,72,0.18)',
              backgroundColor: '#fdfcf8',
              border: '1px solid #e5e0d5',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Animated slide area */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  {/* Card header */}
                  <div style={{ padding: '20px 20px 14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "'DM Serif Display', serif",
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#153830',
                          lineHeight: 1.35,
                          margin: 0,
                          flex: 1,
                          marginRight: 12,
                        }}
                      >
                        {slide.title}
                      </h3>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button
                          style={{
                            color: '#888780',
                            background: 'none',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <Bookmark size={17} strokeWidth={1.5} />
                        </button>
                        <button
                          style={{
                            color: '#888780',
                            background: 'none',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <Share2 size={17} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Category tags */}
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}
                    >
                      {slide.categories.map((cat) => (
                        <span
                          key={cat}
                          style={{
                            background: 'transparent',
                            color: '#0f5f50',
                            border: '0.5px solid rgba(30,138,116,0.4)',
                            borderRadius: 20,
                            padding: '3px 10px',
                            fontSize: 11,
                            fontFamily: "'Noto Sans JP', sans-serif",
                            lineHeight: 1.5,
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arabic block */}
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(30,138,116,0.06)',
                      borderTop: '0.5px solid #d8d4c8',
                      borderBottom: '0.5px solid #d8d4c8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px 24px',
                    }}
                  >
                    <p
                      dir="rtl"
                      lang="ar"
                      style={{
                        fontFamily: "'Simpo', serif",
                        fontSize: 28,
                        color: '#153830',
                        lineHeight: 2.1,
                        textAlign: 'center',
                        margin: 0,
                      }}
                    >
                      {slide.arabicText}
                    </p>
                  </div>

                  {/* Meaning */}
                  <div style={{ padding: '16px 20px 12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Noto Sans JP', sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#1e8a74',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Meaning
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: 'rgba(30,138,116,0.2)',
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: 14,
                        fontStyle: 'italic',
                        color: '#5F5E5A',
                        lineHeight: 1.75,
                        margin: 0,
                      }}
                    >
                      {slide.meaning}
                    </p>
                  </div>

                  {/* Reference row */}
                  <div
                    style={{
                      background: '#faf3e8',
                      padding: '11px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: '#cd9c54',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BookOpen style={{ width: 15, height: 15, color: '#fff' }} />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#8a6830',
                      }}
                    >
                      {slide.reference}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px 16px',
                gap: 7,
                borderTop: '0.5px solid rgba(30,138,116,0.1)',
              }}
            >
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 2,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      height: 7,
                      width: i === currentIndex ? 21 : 7,
                      borderRadius: 4,
                      backgroundColor:
                        i === currentIndex
                          ? '#1e8a74'
                          : 'rgba(30,138,116,0.2)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
