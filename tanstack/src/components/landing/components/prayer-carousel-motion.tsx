import { Bookmark, Heart, Share2, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

interface PrayerCarouselProps {
  className?: string
}

export function PrayerCarouselMotion({ className = '' }: PrayerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bookmarkedPrayers, setBookmarkedPrayers] = useState<Set<number>>(
    new Set(),
  )

  const prayers = LANDING_CONTENT.prayerCarousel
  const totalSlides = prayers.length

  // Toggle bookmark
  const toggleBookmark = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarkedPrayers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Share functionality
  const sharePrayer = (e: React.MouseEvent, prayer: (typeof prayers)[0]) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: prayer.title,
        text: `${prayer.arabicText}\n\n${prayer.translation}`,
      })
    } else {
      navigator.clipboard.writeText(
        `${prayer.title}\n${prayer.arabicText}\n\n${prayer.translation}`,
      )
    }
  }

  // Auto-scroll - simple and clean
  const handleAnimationComplete = () => {
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, 6000)
  }

  return (
    <section className={`relative pb-32 lg:pb-40 overflow-hidden ${className}`}>
      {/* Animated Blobs */}
      <div className="blob bg-teal-200/40 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-teal-900/30"></div>
      <div className="blob bg-emerald-200/40 w-96 h-96 rounded-full bottom-0 -right-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-emerald-900/30"></div>
      <div className="absolute inset-0 hero-pattern"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Carousel Container */}
        <div className="relative bg-card dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Carousel Track with AnimatePresence */}
          <div className="overflow-hidden" style={{ minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                onAnimationComplete={handleAnimationComplete}
              >
                <Card className="border-0 shadow-none rounded-none">
                  <CardContent className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">
                            {prayers[currentIndex].title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {prayers[currentIndex].subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          className={`transition-colors ${
                            bookmarkedPrayers.has(currentIndex)
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          aria-label="Bookmark prayer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleBookmark(e, currentIndex)}
                        >
                          {bookmarkedPrayers.has(currentIndex) ? (
                            <Heart className="w-5 h-5 fill-current" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Share prayer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => sharePrayer(e, prayers[currentIndex])}
                        >
                          <Share2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Prayer Content */}
                    <div className="space-y-6 text-center">
                      {/* Arabic Text */}
                      <p
                        className="font-arabic text-3xl md:text-4xl text-foreground leading-loose"
                        dir="rtl"
                        lang="ar"
                      >
                        {prayers[currentIndex].arabicText}
                      </p>

                      {/* Divider */}
                      <div className="h-1 w-24 bg-teal-500/20 rounded-full mx-auto"></div>

                      {/* Translation */}
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                          Meaning
                        </p>
                        <p className="font-serif text-lg text-muted-foreground italic max-w-2xl mx-auto">
                          "{prayers[currentIndex].translation}"
                        </p>
                      </div>

                      {/* Reference */}
                      <p className="text-sm text-muted-foreground">
                        {prayers[currentIndex].reference}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
