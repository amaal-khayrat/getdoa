import { useEffect, useState, useRef } from 'react'
import { Clock, ImageIcon, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ImageLimitInfo } from '@/lib/image-limit'

interface LimitIndicatorProps {
  limitInfo: ImageLimitInfo
  variant?: 'default' | 'compact'
  className?: string
  onResetTimeReached?: () => void
}

export function LimitIndicator({
  limitInfo,
  variant = 'default',
  className,
  onResetTimeReached,
}: LimitIndicatorProps) {
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const onResetCallback = useRef(onResetTimeReached)

  // Keep callback ref updated
  useEffect(() => {
    onResetCallback.current = onResetTimeReached
  }, [onResetTimeReached])

  // Update countdown - this useEffect is appropriate for timer intervals
  useEffect(() => {
    const updateCountdown = () => {
      const resetTime = new Date(limitInfo.resetAt).getTime()
      const ms = resetTime - Date.now()

      if (ms <= 0) {
        setTimeUntilReset('Now')
        // Notify parent that reset time has been reached
        onResetCallback.current?.()
        return true // Signal to stop interval
      }

      const hours = Math.floor(ms / (1000 * 60 * 60))
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeUntilReset(`${hours}h ${minutes}m`)
      } else {
        setTimeUntilReset(`${minutes}m`)
      }
      return false
    }

    // Initial update
    const shouldStop = updateCountdown()
    if (shouldStop) return

    // Update every minute
    const interval = setInterval(() => {
      const shouldStop = updateCountdown()
      if (shouldStop) clearInterval(interval)
    }, 60000)

    return () => clearInterval(interval)
  }, [limitInfo.resetAt])

  if (variant === 'compact') {
    return (
      <Badge
        variant={limitInfo.canGenerate ? 'secondary' : 'destructive'}
        className={cn('gap-1.5', className)}
      >
        <ImageIcon className="h-3 w-3" />
        {limitInfo.remaining}/{limitInfo.dailyLimit}
        {!limitInfo.canGenerate && (
          <span className="text-xs opacity-75">• {timeUntilReset}</span>
        )}
      </Badge>
    )
  }

  const progressPercent =
    ((limitInfo.dailyLimit - limitInfo.remaining) / limitInfo.dailyLimit) * 100

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        limitInfo.canGenerate
          ? 'bg-primary/5 border-primary/20'
          : 'bg-amber-500/10 border-amber-500/30',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {limitInfo.canGenerate ? (
            <Sparkles className="h-4 w-4 text-primary" />
          ) : (
            <Clock className="h-4 w-4 text-amber-600" />
          )}
          <span className="font-medium text-sm">
            {limitInfo.canGenerate ? 'Ready to Create' : 'Daily Limit Reached'}
          </span>
        </div>
        <Badge variant={limitInfo.canGenerate ? 'default' : 'secondary'}>
          {limitInfo.remaining} left today
        </Badge>
      </div>

      <Progress value={progressPercent} className="h-2 mb-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {limitInfo.usedToday} of {limitInfo.dailyLimit} used
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Resets in {timeUntilReset}
        </span>
      </div>
    </div>
  )
}
