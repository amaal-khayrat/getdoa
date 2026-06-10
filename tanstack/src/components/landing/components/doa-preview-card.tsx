import { useState, useEffect } from 'react'
import { Sun, Bookmark, Share2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { LANDING_CONTENT } from '@/lib/constants'

export function DoaPreviewCard() {
  const prayers = LANDING_CONTENT.prayerCarousel
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prayers.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [prayers.length])

  const prayer = prayers[currentIndex]

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    setBookmarked((prev) => {
      const next = new Set(prev)
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex)
      return next
    })
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid rgba(30, 138, 116, 0.14)',
        boxShadow: '0 8px 32px rgba(30, 138, 116, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Fixed-height animated area so card never reflows between slides */}
      <div style={{ minHeight: 420 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Card header */}
            <div className="flex items-center" style={{ padding: '20px 24px 17px', gap: 12 }}>
              <div className="flex items-center justify-center" style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(30, 138, 116, 0.1)',
                flexShrink: 0,
              }}>
                <Sun size={18} color="#1e8a74" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#153830',
                }}>
                  {prayer.title}
                </div>
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 12,
                  color: '#888780',
                  marginTop: 2,
                }}>
                  {prayer.subtitle}
                </div>
              </div>
              <div className="flex items-center ml-auto" style={{ gap: 10 }}>
                <button
                  onClick={toggleBookmark}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="Bookmark"
                >
                  <Bookmark
                    size={18}
                    color="#888780"
                    strokeWidth={1.5}
                    fill={bookmarked.has(currentIndex) ? '#888780' : 'none'}
                  />
                </button>
                <Share2 size={18} color="#888780" strokeWidth={1.5} />
              </div>
            </div>

            {/* Arabic block */}
            <div style={{
              backgroundColor: 'rgba(30, 138, 116, 0.05)',
              borderTop: '0.5px solid rgba(30, 138, 116, 0.15)',
              borderBottom: '0.5px solid rgba(30, 138, 116, 0.15)',
              padding: '30px 24px',
            }}>
              <p
                style={{
                  fontFamily: "'Simpo', serif",
                  fontSize: 28,
                  color: '#153830',
                  direction: 'rtl',
                  lineHeight: 2.15,
                  textAlign: 'center',
                  margin: 0,
                }}
                lang="ar"
              >
                {prayer.arabicText}
              </p>
            </div>

            {/* Meaning section */}
            <div style={{ padding: '18px 24px 10px' }}>
              <div className="flex items-center" style={{ gap: 9, marginBottom: 10 }}>
                <span style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#1e8a74',
                  flexShrink: 0,
                }}>
                  Meaning
                </span>
                <div style={{ flex: 1, height: 0.5, backgroundColor: 'rgba(30, 138, 116, 0.2)' }} />
              </div>
              <p style={{
                fontFamily: "'Lora', serif",
                fontSize: 15,
                fontStyle: 'italic',
                color: '#5F5E5A',
                lineHeight: 1.75,
                margin: 0,
              }}>
                {prayer.translation}
              </p>
            </div>

            {/* Reference */}
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 12,
              color: '#888780',
              textAlign: 'center',
              padding: '9px 24px 18px',
            }}>
              {prayer.reference}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div
        className="flex items-center justify-center"
        style={{
          padding: '12px 24px 16px',
          gap: 7,
          borderTop: '0.5px solid rgba(30, 138, 116, 0.1)',
        }}
      >
        {prayers.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
          >
            <div style={{
              height: 7,
              width: i === currentIndex ? 21 : 7,
              borderRadius: 4,
              backgroundColor: i === currentIndex ? '#1e8a74' : 'rgba(30, 138, 116, 0.2)',
              transition: 'all 0.3s ease',
            }} />
          </button>
        ))}
      </div>
    </div>
  )
}
