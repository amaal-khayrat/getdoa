import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const BACKGROUND_COUNT = 12

interface BackgroundPickerProps {
  selectedId: number
  onSelect: (id: number) => void
}

export function BackgroundPicker({
  selectedId,
  onSelect,
}: BackgroundPickerProps) {
  const backgrounds = Array.from({ length: BACKGROUND_COUNT }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
      {backgrounds.map((id) => {
        const isSelected = selectedId === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all',
              'hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isSelected
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-transparent hover:border-muted-foreground/30',
            )}
          >
            <img
              src={`/assets/ai/${id}.jpeg`}
              alt={`Background ${id}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Selection overlay */}
            {isSelected && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
