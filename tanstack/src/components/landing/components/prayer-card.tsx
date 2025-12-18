import { Bookmark, Share2, Sun } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

interface PrayerCardProps {
  className?: string
}

export function PrayerCard({ className = '' }: PrayerCardProps) {
  return (
    <Card
      className={`w-full max-w-sm ${className} border border-border hover:shadow-lg transition-all duration-500 transform md:rotate-2 hover:rotate-0`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Sun className="w-5 h-5" />
          </div>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Bookmark prayer"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Prayer Content */}
        <div className="space-y-4 text-center">
          {/* Arabic Text */}
          <p
            className="font-arabic text-2xl leading-loose text-foreground"
            dir="rtl"
            lang="ar"
          >
            {LANDING_CONTENT.prayerCard.arabicText}
          </p>

          {/* Section Label */}
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Meanings
          </p>

          {/* Translation */}
          <p className="font-serif text-muted-foreground italic">
            {LANDING_CONTENT.prayerCard.translation}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>{LANDING_CONTENT.prayerCard.reference}</span>
          <button
            className="hover:text-foreground transition-colors"
            aria-label="Share prayer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
