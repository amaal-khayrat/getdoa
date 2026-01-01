import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, Eye, Download, ExternalLink } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { getFavoriteLists } from './dashboard/functions'
import { useSession } from '@/lib/auth-client'
import type { DoaListWithUser } from '@/types/doa-list.types'

export const Route = createFileRoute('/dashboard/saved-lists')({
  loader: async () => {
    // Data will be loaded client-side using useSession
    return {}
  },
  component: SavedListsPage,
  head: () => ({
    title: 'Saved Lists - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'View and manage your saved prayer lists from other users.',
      },
    ],
  }),
})

function SavedListsPage() {
  const { data: session } = useSession()
  const [favoriteLists, setFavoriteLists] = React.useState<
    (DoaListWithUser & { itemCount: number })[]
  >([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadFavorites() {
      if (!session?.user) {
        setIsLoading(false)
        return
      }

      try {
        const lists = await getFavoriteLists({
          data: { userId: session.user.id },
        })
        setFavoriteLists(lists)
      } catch (error) {
        console.error('Failed to load favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [session?.user])

  const isEmpty = favoriteLists.length === 0

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            Saved Lists
          </h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Saved Lists
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEmpty
            ? 'Discover and save prayer lists from other users'
            : `${favoriteLists.length} saved list${favoriteLists.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Lists Grid */}
      {isEmpty ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No saved lists yet</EmptyTitle>
            <EmptyDescription>
              Browse public prayer lists and save your favorites for quick
              access.
            </EmptyDescription>
          </EmptyHeader>
          <Link to="/doa" className={buttonVariants()}>
            Browse Duas
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteLists.map((list) => (
            <SavedListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  )
}

function SavedListCard({ list }: { list: DoaListWithUser & { itemCount: number } }) {
  const prayerCount = list.itemCount

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <a href={`/list/${list.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {list.name}
              </CardTitle>
            </a>
            <CardDescription className="flex items-center gap-2">
              <span>{prayerCount} duas</span>
            </CardDescription>
          </div>
          <a
            href={`/list/${list.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {list.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {list.description}
          </p>
        )}

        {/* Author info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={list.user.image || ''} alt={list.user.name} />
            <AvatarFallback className="text-xs">
              {getInitials(list.user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            by {list.user.name}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant="outline">
            {list.language === 'my' ? 'BM' : 'EN'}
          </Badge>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {list.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" /> {list.exportCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {list.favoriteCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
