import { Link } from '@tanstack/react-router'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Gift, Crown, Info } from 'lucide-react'
import type { ListLimitInfo } from '@/lib/list-limit'
import { cn } from '@/lib/utils'

interface ListLimitIndicatorProps {
  limitInfo: ListLimitInfo
  variant?: 'compact' | 'detailed' | 'full'
  className?: string
}

export function ListLimitIndicator({
  limitInfo,
  variant = 'compact',
  className,
}: ListLimitIndicatorProps) {
  const {
    current,
    limit,
    remaining,
    canCreate,
    breakdown,
    hasSubscription,
    referralPotential,
  } = limitInfo
  const progress = limit > 0 ? (current / limit) * 100 : 0
  const isAtLimit = !canCreate

  // Compact: Just shows "X/Y lists" with optional unlock badge
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <span
          className={cn(
            'font-medium',
            isAtLimit ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {current}/{limit} lists
        </span>
        {isAtLimit && (referralPotential > 0 || !hasSubscription) && (
          <Badge
            variant="outline"
            className="gap-1 cursor-pointer hover:bg-primary/10"
            render={<Link to="/dashboard/referrals" />}
          >
            <Gift className="h-3 w-3" />
            Unlock more
          </Badge>
        )}
      </div>
    )
  }

  // Detailed: Shows breakdown by source with tooltip
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">List Limit</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    'font-medium flex items-center gap-1',
                    isAtLimit ? 'text-destructive' : '',
                  )}
                />
              }
            >
              {current} / {limit}
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 text-xs">
                <p>Base: {breakdown.base}</p>
                {breakdown.referral > 0 && (
                  <p>Referrals: +{breakdown.referral}</p>
                )}
                {breakdown.purchase > 0 && (
                  <p>Purchased: +{breakdown.purchase}</p>
                )}
                {breakdown.subscription > 0 && (
                  <p>Subscription: +{breakdown.subscription}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    )
  }

  // Full: Complete breakdown with progress and CTAs
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Prayer Lists</span>
        <span
          className={cn('text-sm font-bold', isAtLimit && 'text-destructive')}
        >
          {current} / {limit}
        </span>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
          Base: {breakdown.base}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          Referrals: +{breakdown.referral}
        </div>
        {breakdown.purchase > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Purchased: +{breakdown.purchase}
          </div>
        )}
        {breakdown.subscription > 0 && (
          <div className="flex items-center gap-1.5 text-primary">
            <Crown className="h-3 w-3" />
            Subscription: +{breakdown.subscription}
          </div>
        )}
      </div>

      {/* Status/CTA */}
      {isAtLimit ? (
        <div className="pt-2 border-t space-y-2">
          <p className="text-sm text-muted-foreground">
            {hasSubscription
              ? "You've reached your maximum limit."
              : 'Invite friends or upgrade to unlock more lists.'}
          </p>
          {!hasSubscription && referralPotential > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link to="/dashboard/referrals" className="gap-1" />}
            >
              <Gift className="h-4 w-4" />
              Invite Friends
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground pt-2 border-t">
          {remaining} {remaining === 1 ? 'list' : 'lists'} remaining
        </p>
      )}
    </div>
  )
}
