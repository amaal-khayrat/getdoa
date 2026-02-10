import { useRef, useEffect, useCallback } from 'react'
import { Check, Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PATTERNS,
  type PatternId,
  type PatternCategory,
} from '@/types/premium.types'
import { renderPattern } from '@/utils/patterns'

interface PatternPickerProps {
  selectedPattern: PatternId | null
  onSelect: (pattern: PatternId | null) => void
  isPremium: boolean
}

// Group patterns by category for organized display
const CATEGORY_LABELS: Record<PatternCategory, string> = {
  'islamic-geometric': 'Islamic Geometric',
  architectural: 'Architectural',
  organic: 'Organic',
  abstract: 'Abstract',
  minimalist: 'Minimalist',
}

const CATEGORY_ORDER: PatternCategory[] = [
  'minimalist',
  'islamic-geometric',
  'organic',
  'architectural',
  'abstract',
]

function PatternsByCategory(): Record<PatternCategory, typeof PATTERNS> {
  const grouped = {} as Record<PatternCategory, typeof PATTERNS>
  for (const cat of CATEGORY_ORDER) {
    grouped[cat] = PATTERNS.filter((p) => p.category === cat)
  }
  return grouped
}

// Canvas thumbnail component for pattern preview
function PatternThumbnail({
  patternId,
  isSelected,
  isLocked,
  onClick,
  patternName,
}: {
  patternId: PatternId
  isSelected: boolean
  isLocked: boolean
  onClick: () => void
  patternName: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw pattern on mount and when patternId changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render pattern
    renderPattern(ctx, patternId, {
      width: canvas.width,
      height: canvas.height,
      primaryColor: '#1a1a1a',
      secondaryColor: '#ffffff',
      opacity: 0.3,
    })
  }, [patternId])

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all',
        'hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-transparent hover:border-muted-foreground/30',
        isLocked && 'opacity-60 cursor-not-allowed hover:scale-100 hover:border-transparent',
      )}
      title={isLocked ? `${patternName} (Premium)` : patternName}
    >
      <canvas
        ref={canvasRef}
        width={120}
        height={90}
        className="w-full h-full"
      />

      {/* Pattern name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
        <p className="text-xs text-white truncate">{patternName}</p>
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Lock icon for premium patterns */}
      {isLocked && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-muted/90 flex items-center justify-center">
          <Lock className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </button>
  )
}

export function PatternPicker({
  selectedPattern,
  onSelect,
  isPremium,
}: PatternPickerProps) {
  const patternsByCategory = PatternsByCategory()

  const handleSelect = useCallback(
    (patternId: PatternId, isPremiumPattern: boolean) => {
      if (!isPremiumPattern || isPremium) {
        // Toggle off if clicking the same pattern
        onSelect(selectedPattern === patternId ? null : patternId)
      }
    },
    [selectedPattern, onSelect, isPremium],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Decorative Pattern
        </label>
        {selectedPattern && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {CATEGORY_ORDER.map((category) => {
        const patterns = patternsByCategory[category]
        if (patterns.length === 0) return null

        return (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {patterns.map((pattern) => {
                const isSelected = selectedPattern === pattern.id
                const isLocked = pattern.isPremium && !isPremium

                return (
                  <PatternThumbnail
                    key={pattern.id}
                    patternId={pattern.id}
                    patternName={pattern.name}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    onClick={() => handleSelect(pattern.id, pattern.isPremium)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {!isPremium && (
        <p className="text-xs text-muted-foreground">
          Upgrade to Premium to unlock all 20 decorative patterns
        </p>
      )}
    </div>
  )
}
