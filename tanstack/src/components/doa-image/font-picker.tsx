import { Check } from 'lucide-react'
import type {
  ArabicFont,
  TranslationFont,
} from '@/types/image-customization.types'
import { cn } from '@/lib/utils'
import {
  ARABIC_FONTS,
  TRANSLATION_FONTS,
} from '@/types/image-customization.types'

interface FontPickerProps {
  type: 'arabic' | 'translation'
  selectedFont: ArabicFont | TranslationFont
  onSelect: (font: ArabicFont | TranslationFont) => void
}

export function FontPicker({ type, selectedFont, onSelect }: FontPickerProps) {
  const fonts = type === 'arabic' ? ARABIC_FONTS : TRANSLATION_FONTS

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {type === 'arabic' ? 'Arabic Font' : 'Translation Font'}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(fonts).map(([fontId, fontInfo]) => {
          const isSelected = selectedFont === fontId

          return (
            <button
              key={fontId}
              type="button"
              onClick={() => onSelect(fontId as ArabicFont | TranslationFont)}
              className={cn(
                'relative flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                'hover:border-muted-foreground/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border',
              )}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'font-medium text-sm truncate',
                    type === 'arabic' && 'font-arabic',
                  )}
                  style={{
                    fontFamily:
                      type === 'arabic' ? fontInfo.name : fontInfo.name,
                  }}
                >
                  {fontInfo.displayName}
                </p>
                {type === 'arabic' && (
                  <p
                    className="text-xs text-muted-foreground mt-1 font-arabic"
                    style={{ fontFamily: fontInfo.name }}
                    dir="rtl"
                  >
                    بسم الله
                  </p>
                )}
              </div>

              <div className="ml-2 flex-shrink-0">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
