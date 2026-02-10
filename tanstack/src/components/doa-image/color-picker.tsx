import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DEFAULT_EXPORT_SETTINGS } from '@/types/premium.types'

interface ColorPickerProps {
  type: 'background' | 'text' | 'translation'
  selectedColor: string
  onSelect: (color: string) => void
  isPremium: boolean
}

// Preset colors for quick selection
const PRESET_COLORS: Record<string, string[]> = {
  background: [
    '#ffffff', // White (default)
    '#f8f9fa', // Light gray
    '#fdf6e3', // Cream
    '#f0f7f4', // Mint
    '#f5f0e8', // Warm beige
    '#e8f4f8', // Light blue
  ],
  text: [
    '#1a1a1a', // Near black (default)
    '#333333', // Dark gray
    '#2c3e50', // Dark blue
    '#1e3a28', // Dark green
    '#4a3728', // Dark brown
    '#2d2d44', // Dark purple
  ],
  translation: [
    '#666666', // Gray (default)
    '#888888', // Medium gray
    '#5c7c69', // Sage green
    '#6b7c8c', // Slate blue
    '#7c6b5c', // Taupe
    '#6c5b7c', // Dusty purple
  ],
}

const TYPE_LABELS: Record<string, string> = {
  background: 'Background',
  text: 'Arabic Text',
  translation: 'Translation Text',
}

const DEFAULT_COLORS: Record<string, string> = {
  background: DEFAULT_EXPORT_SETTINGS.backgroundColor,
  text: DEFAULT_EXPORT_SETTINGS.textColor,
  translation: DEFAULT_EXPORT_SETTINGS.translationColor,
}

export function ColorPicker({
  type,
  selectedColor,
  onSelect,
  isPremium,
}: ColorPickerProps) {
  const presets = PRESET_COLORS[type]
  const defaultColor = DEFAULT_COLORS[type]

  const handleColorChange = (color: string) => {
    if (isPremium || color === defaultColor) {
      onSelect(color)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {TYPE_LABELS[type]} Color
      </label>

      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {presets.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.toLowerCase()
          const isPresetDefault = color === defaultColor
          const isColorLocked = !isPremium && !isPresetDefault

          return (
            <button
              key={color}
              type="button"
              onClick={() => handleColorChange(color)}
              disabled={isColorLocked}
              className={cn(
                'relative w-8 h-8 rounded-lg border-2 transition-all',
                'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent',
                isColorLocked && 'opacity-50 cursor-not-allowed hover:scale-100',
              )}
              style={{ backgroundColor: color }}
              title={isColorLocked ? 'Premium only' : color}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={cn(
                      'w-4 h-4',
                      type === 'background' ? 'text-foreground' : 'text-white',
                    )}
                  />
                </div>
              )}
              {isColorLocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Custom color input (premium only) */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'relative',
            !isPremium && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Input
            type="color"
            value={selectedColor}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={!isPremium}
            className="w-10 h-10 p-1 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        <Input
          type="text"
          value={selectedColor}
          onChange={(e) => {
            const value = e.target.value
            // Validate hex color format
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
              handleColorChange(value)
            }
          }}
          disabled={!isPremium}
          placeholder="#000000"
          className={cn(
            'w-24 font-mono text-sm',
            !isPremium && 'opacity-50 cursor-not-allowed',
          )}
        />
        {!isPremium && (
          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {!isPremium && (
        <p className="text-xs text-muted-foreground">
          Upgrade to Premium for custom colors
        </p>
      )}
    </div>
  )
}
