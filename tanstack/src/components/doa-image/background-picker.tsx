import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Background images are numbered 1-12 in /src/assets/ai/
const BACKGROUND_COUNT = 12

interface BackgroundPickerProps {
  selectedId: number
  onSelect: (id: number) => void
}

export function BackgroundPicker({ selectedId, onSelect }: BackgroundPickerProps) {
  const backgrounds = Array.from({ length: BACKGROUND_COUNT }, (_, i) => i + 1)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Choose Background</h3>
      <p className="text-sm text-muted-foreground">
        Select a beautiful background for your doa image
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {backgrounds.map((id) => {
          const isSelected = selectedId === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <img
                src={`/src/assets/ai/${id}.jpeg`}
                alt={`Background ${id}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Selection overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              {!isSelected && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
