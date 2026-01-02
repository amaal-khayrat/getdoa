import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepHeaderProps {
  step: number
  title: string
  subtitle?: string
  isComplete?: boolean
  isActive?: boolean
  className?: string
}

export function StepHeader({
  step,
  title,
  subtitle,
  isComplete = false,
  isActive = false,
  className,
}: StepHeaderProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
          isComplete
            ? 'bg-primary text-primary-foreground'
            : isActive
              ? 'bg-primary/20 text-primary border-2 border-primary'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {isComplete ? <Check className="h-4 w-4" /> : step}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
