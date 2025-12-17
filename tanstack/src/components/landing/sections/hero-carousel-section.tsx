import { PrayerCarousel } from '../components/prayer-carousel'

export function HeroCarouselSection() {
  return (
    <section className="relative pb-32 lg:pb-40 overflow-hidden">
      {/* Animated Blobs */}
      <div className="blob bg-teal-200/40 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-teal-900/30"></div>
      <div className="blob bg-emerald-200/40 w-96 h-96 rounded-full bottom-0 -right-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-emerald-900/30"></div>
      <div className="absolute inset-0 hero-pattern"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="overflow-hidden rounded-2xl">
          <div className="prayer-carousel">
            <div className="prayer-carousel-track">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="prayer-carousel-item">
                  <PrayerCarousel />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
