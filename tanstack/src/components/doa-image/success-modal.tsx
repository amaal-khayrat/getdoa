import { Download, Share2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  filename: string
  onDownload: () => void
}

export function SuccessModal({
  open,
  onOpenChange,
  imageUrl,
  filename,
  onDownload,
}: SuccessModalProps) {
  const handleShare = async () => {
    if (!imageUrl) return

    // Try native share if available
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], filename, { type: 'image/png' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Doa Image',
            text: 'Check out this beautiful doa image I created on GetDoa!',
            files: [file],
          })
          return
        }
      } catch (err) {
        // User cancelled or share failed, fall through to download
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }

    // Fallback: just download
    onDownload()
    toast.success('Image downloaded! You can now share it manually.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Image Created!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          {imageUrl && (
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
              <img
                src={imageUrl}
                alt="Generated doa image"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your image has been saved. Share it with friends and family!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
