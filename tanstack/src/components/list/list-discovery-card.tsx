import { useState, useTransition } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, Download, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  addFavoriteList,
  removeFavoriteList,
} from '@/routes/dashboard/functions'
import type { PublicListItem } from '@/routes/dashboard/functions'

interface ListDiscoveryCardProps {
  list: PublicListItem
  isAuthenticated: boolean
  userId?: string
}

export function ListDiscoveryCard({
  list,
  isAuthenticated,
  userId,
}: ListDiscoveryCardProps) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  // Optimistic state
  const [optimisticFavorited, setOptimisticFavorited] = useState(
    list.isFavorited,
  )
  const [optimisticCount, setOptimisticCount] = useState(list.favoriteCount)

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  // Is this the user's own list?
  const isOwnList = userId === list.userId

  // Compute author display name based on privacy settings
  const authorDisplayName =
    list.authorPrivacy.displayName ??
    (list.authorPrivacy.showFullName
      ? list.user.name
      : getInitials(list.user.name))

  // Determine if avatar should be shown
  const showAuthorAvatar =
    list.authorPrivacy.showAvatar && list.user.image

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent card link navigation
    e.stopPropagation()

    if (!isAuthenticated || !userId) {
      toast.info('Please sign in to save lists')
      navigate({ to: '/login' })
      return
    }

    if (isOwnList) {
      toast.error("You can't favorite your own list")
      return
    }

    const wasFavorited = optimisticFavorited

    // Optimistic update
    setOptimisticFavorited(!wasFavorited)
    setOptimisticCount((prev) => (wasFavorited ? prev - 1 : prev + 1))

    startTransition(async () => {
      try {
        if (wasFavorited) {
          await removeFavoriteList({ data: { userId, listId: list.id } })
          toast.success('Removed from saved lists')
        } else {
          await addFavoriteList({ data: { userId, listId: list.id } })
          toast.success('Added to saved lists')
        }
      } catch {
        // Rollback on error
        setOptimisticFavorited(wasFavorited)
        setOptimisticCount((prev) => (wasFavorited ? prev + 1 : prev - 1))
        toast.error('Failed to update. Please try again.')
      }
    })
  }

  return (
    <Card className="group hover:shadow-md transition-shadow relative">
      <Link to="/list/$listId" params={{ listId: list.id }} className="block">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                {list.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <span>{list.itemCount} duas</span>
                <Badge variant="outline" className="text-xs">
                  {list.language === 'my' ? 'BM' : 'EN'}
                </Badge>
              </CardDescription>
            </div>

            {/* Favorite Button - Only show if not own list */}
            {!isOwnList && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 shrink-0 ${
                  optimisticFavorited
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
                onClick={handleToggleFavorite}
                disabled={isPending}
                aria-label={
                  optimisticFavorited
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
                aria-pressed={optimisticFavorited}
              >
                <Heart
                  className={`h-4 w-4 ${optimisticFavorited ? 'fill-current' : ''}`}
                />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {list.description}
            </p>
          )}

          {/* Author info - Links to profile */}
          <Link
            to="/user/$userId"
            params={{ userId: list.userId }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-6 w-6">
              {showAuthorAvatar ? (
                <AvatarImage
                  src={list.user.image || ''}
                  alt={authorDisplayName}
                />
              ) : null}
              <AvatarFallback className="text-xs">
                {getInitials(authorDisplayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate hover:text-foreground transition-colors">
              by {authorDisplayName}
            </span>
          </Link>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {list.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" /> {list.exportCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {optimisticCount}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
