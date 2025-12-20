import * as React from 'react'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

interface QrCodeDisplayProps {
  qrContent: string
  supportedPayment: Array<string>
  size?: number
  className?: string
}

export function QrCodeDisplay({
  qrContent,
  supportedPayment,
  size = 250,
  className,
}: QrCodeDisplayProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useLayoutEffect(() => {
    if (!canvasRef.current || !qrContent) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = size
    canvas.height = size

    setIsLoading(true)
    setError(null)

    QRCode.toCanvas(canvas, qrContent, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then(() => {
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Error generating QR code:', err)
        setError('Failed to generate QR code')
        setIsLoading(false)
      })
  }, [qrContent, size])

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-border',
          className,
        )}
        style={{ width: size, height: size }}
      >
        <p className="text-center text-sm text-muted-foreground px-2">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        className={cn(
          'border-2 border-border rounded-lg bg-card',
          isLoading && 'opacity-0',
        )}
        style={{ width: size, height: size }}
      />
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg border-2 border-border"
          style={{ width: size, height: size }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
