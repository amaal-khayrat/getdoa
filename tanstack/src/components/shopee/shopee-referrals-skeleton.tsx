import { Card, CardContent } from '@/components/ui/card'

interface ShopeeReferralsSkeletonProps {
  count?: number
}

export function ShopeeReferralsSkeleton({ count = 4 }: ShopeeReferralsSkeletonProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden h-full">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-muted animate-pulse rounded ${className || ''}`}
    />
  )
}
