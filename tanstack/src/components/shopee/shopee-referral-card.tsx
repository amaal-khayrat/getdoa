import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ShopeeOgData } from '@/types/shopee.types'

interface ShopeeReferralCardProps {
  url: string
  ogData?: ShopeeOgData
  isLoading?: boolean
  priority?: boolean
}

export function ShopeeReferralCard({
  url,
  ogData,
  isLoading,
  priority = false,
}: ShopeeReferralCardProps) {
  const [imageError, setImageError] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden h-full">
        <div className="aspect-square bg-muted animate-pulse" />
        <CardContent className="p-3 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Error state - image failed to load or no OG data
  const showError = !ogData?.image || imageError

  if (showError) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Card className="overflow-hidden h-full hover:ring-2 hover:ring-primary transition-all">
          <div className="aspect-square flex items-center justify-center bg-muted p-4">
            <div className="text-center text-muted-foreground">
              <ExternalLink className="w-8 h-8 mx-auto mb-2" />
              <span className="text-xs">View on Shopee</span>
            </div>
          </div>
          <CardContent className="p-3">
            <p className="text-sm font-medium line-clamp-2">
              {ogData?.title || 'Product unavailable'}
            </p>
            {ogData?.price && (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {ogData.price}
              </p>
            )}
          </CardContent>
        </Card>
      </a>
    )
  }

  // Success state - full card with OG data
  const hasDiscount =
    ogData.originalPrice && ogData.originalPrice !== ogData.price

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Card className="overflow-hidden h-full hover:ring-2 hover:ring-primary transition-all group">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={ogData.image}
            alt={ogData.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onError={() => setImageError(true)}
          />
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-xs"
            >
              Sale
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <h4 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {ogData.title}
          </h4>
          {ogData.location && (
            <p className="text-xs text-muted-foreground">{ogData.location}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {ogData.price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {ogData.originalPrice}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
