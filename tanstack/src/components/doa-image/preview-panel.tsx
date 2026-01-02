import { ImageIcon } from 'lucide-react'
import type { DoaItem, Language } from '@/types/doa.types'
import { truncateText } from '@/utils/text-helpers'

interface PreviewPanelProps {
  doa: DoaItem | null
  backgroundId: number
  language: Language
  isLoading?: boolean
  generatedImageUrl?: string | null
}

export function PreviewPanel({
  doa,
  backgroundId,
  language,
  isLoading = false,
  generatedImageUrl,
}: PreviewPanelProps) {
  // If we have a generated image, show it
  if (generatedImageUrl) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Generated Image</h3>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
          <img
            src={generatedImageUrl}
            alt="Generated doa image"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Preview</h3>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Generating image...</p>
          </div>
        </div>
      </div>
    )
  }

  // No doa selected state
  if (!doa) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Preview</h3>
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
          <div className="text-center space-y-3 p-6">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/50" />
            <div>
              <p className="font-medium text-muted-foreground">
                No doa selected
              </p>
              <p className="text-sm text-muted-foreground/70">
                Select a doa to see a preview
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preview with selected doa and background
  const doaName = language === 'my' ? doa.nameMy : doa.nameEn
  const translation = language === 'my' ? doa.meaningMy : doa.meaningEn

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Preview</h3>
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden border">
        {/* Background image */}
        <img
          src={`/assets/ai/${backgroundId}.jpeg`}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-white">
          {/* Top: Doa name */}
          <div className="text-center pt-4">
            <h4 className="text-lg font-serif font-bold drop-shadow-lg">
              {truncateText(doaName, 50)}
            </h4>
          </div>

          {/* Center: Arabic text and translation */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-8">
            {/* Arabic text */}
            <p
              className="font-arabic text-2xl text-center leading-relaxed drop-shadow-lg max-w-full"
              dir="rtl"
            >
              {truncateText(doa.content, 150)}
            </p>

            {/* Translation */}
            <p className="text-sm text-center text-white/90 leading-relaxed max-w-[90%] drop-shadow">
              {truncateText(translation || '', 200)}
            </p>
          </div>

          {/* Bottom: Branding */}
          <div className="text-center pb-2">
            <p className="font-serif font-semibold text-lg drop-shadow-lg">
              GetDoa
            </p>
            <p className="text-sm text-white/80 drop-shadow">getdoa.com</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        This is a simplified preview. The final image will have full text and
        better formatting.
      </p>
    </div>
  )
}
