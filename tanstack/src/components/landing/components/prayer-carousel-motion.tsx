import { Bookmark, ChevronLeft, ChevronRight, Share2, Sun } from 'lucide-react'
import { motion, useAnimation } from 'framer-motion'
import { useState } from 'react'
import type { PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LANDING_CONTENT } from '@/lib/constants'

interface PrayerCarouselProps {
  className?: string
}

export function PrayerCarouselMotion({ className = '' }: PrayerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const controls = useAnimation()

  const prayers = LANDING_CONTENT.prayerCarousel
  const totalSlides = prayers.length

  // Handle drag
  const handleDragEnd = (info: PanInfo) => {
    const { offset, velocity } = info

    const swipeThreshold = 50
    const swipeConfidenceThreshold = 500

    if (offset.x < -swipeThreshold || velocity.x < -swipeConfidenceThreshold) {
      // Swipe left - next slide
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    } else if (
      offset.x > swipeThreshold ||
      velocity.x > swipeConfidenceThreshold
    ) {
      // Swipe right - previous slide
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    }
  }

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    controls.stop()
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
    controls.stop()
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    controls.stop()
  }

  // Auto-scroll - use animation onComplete callback
  const handleAnimationComplete = () => {
    if (!isPaused) {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides)
      }, 2000)
    }
  }

  return (
    <section className={`relative pb-32 lg:pb-40 overflow-hidden ${className}`}>
      {/* Animated Blobs */}
      <div className="blob bg-teal-200/40 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-teal-900/30"></div>
      <div className="blob bg-emerald-200/40 w-96 h-96 rounded-full bottom-0 -right-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-emerald-900/30"></div>
      <div className="absolute inset-0 hero-pattern"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Carousel Container */}
        <div
          className="relative bg-card dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={prevSlide}
            aria-label="Previous prayer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={nextSlide}
            aria-label="Next prayer"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Carousel Track with Framer Motion */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              animate={{ x: `${-currentIndex * 100}%` }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onAnimationComplete={handleAnimationComplete}
            >
              {/* Render slides */}
              {[...prayers, ...prayers].map((prayer, index) => (
                <motion.div
                  key={`${prayer.title}-${index}`}
                  className="w-full flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
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
                              {prayer.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {prayer.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Bookmark prayer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Bookmark className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Share prayer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Share2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Prayer Content */}
                      <div className="space-y-6 text-center">
                        {/* Arabic Text with animation */}
                        <motion.p
                          className="font-arabic text-3xl md:text-4xl text-foreground leading-loose"
                          dir="rtl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {prayer.arabicText}
                        </motion.p>

                        {/* Animated Divider */}
                        <motion.div
                          className="h-1 w-24 bg-teal-500/20 rounded-full mx-auto"
                          initial={{ width: 0 }}
                          animate={{ width: '6rem' }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>

                        {/* Translation */}
                        <div className="space-y-3">
                          <motion.p
                            className="text-xs text-muted-foreground uppercase tracking-widest font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            Meanings
                          </motion.p>
                          <motion.p
                            className="font-serif text-lg text-muted-foreground italic max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            "{prayer.translation}"
                          </motion.p>
                        </div>

                        {/* Reference */}
                        <motion.p
                          className="text-sm text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {prayer.reference}
                        </motion.p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {prayers.map((_, index) => (
              <motion.button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-teal-500 w-8'
                    : 'bg-muted-foreground/30 w-2'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
              />
            ))}
          </div>

          {/* Floating Badge */}
          <motion.div
            className="absolute -bottom-4 -right-4 bg-green-100 text-green-600 rounded-lg p-4 shadow-lg border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-3 z-20"
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="bg-green-500 text-white rounded-lg p-2">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">
                Daily Goal
              </p>
              <p className="text-sm font-bold text-green-800 dark:text-green-200">
                Completed
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
