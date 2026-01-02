import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Calendar, BookOpen, Heart, Lock, Eye } from 'lucide-react'
import { getPublicProfile } from './dashboard/functions/profile'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { LanguageProvider } from '@/contexts/language-context'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import type { PublicProfileData } from './dashboard/functions/profile'

export const Route = createFileRoute('/user/$userId')({
  loader: async ({ params }) => {
    const profile = await getPublicProfile({ data: { userId: params.userId } })

    if (!profile) {
      throw notFound()
    }

    return { profile }
  },

  component: UserProfilePage,

  head: ({ loaderData }) => {
    if (!loaderData?.profile) {
      return {
        title: 'Profile Not Found - GetDoa',
        meta: [{ name: 'robots', content: 'noindex' }],
      }
    }

    const { profile } = loaderData
    const listCount = profile.lists.length
    const title = `${profile.displayName}'s Prayer Lists - GetDoa`
    const description =
      profile.bio ??
      `Browse ${listCount} prayer list${listCount === 1 ? '' : 's'} by ${profile.displayName}`

    return {
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        { name: 'robots', content: 'index, follow' },
      ],
    }
  },

  notFoundComponent: () => (
    <LanguageProvider>
      <LandingLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-semibold mb-4">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This profile doesn't exist or is set to private.
          </p>
          <Link to="/lists" className={buttonVariants()}>
            Browse Public Lists
          </Link>
        </div>
      </LandingLayout>
    </LanguageProvider>
  ),
})

function UserProfilePage() {
  const { profile } = Route.useLoaderData()

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

  return (
    <LanguageProvider>
      <LandingLayout navbarVariant="doa">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            {/* Avatar */}
            <Avatar className="h-24 w-24 text-2xl">
              {profile.showAvatar && profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.displayName} />
              ) : null}
              <AvatarFallback>
                {profile.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold font-display mb-2">
                {profile.displayName}
              </h1>

              {profile.bio && (
                <p className="text-muted-foreground mb-4 max-w-lg">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {profile.lists.length} list
                  {profile.lists.length === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(profile.joinedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs for Lists and Favorites */}
          <Tabs defaultValue="lists" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="lists">
                <BookOpen className="h-4 w-4 mr-2" />
                Prayer Lists ({profile.lists.length})
              </TabsTrigger>
              {profile.favorites !== null && (
                <TabsTrigger value="favorites">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites ({profile.favorites.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* User's Lists */}
            <TabsContent value="lists">
              {profile.lists.length === 0 ? (
                <Empty className="border py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookOpen className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>No public lists yet</EmptyTitle>
                    <EmptyDescription>
                      This user hasn't published any public prayer lists.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.lists.map((list) => (
                    <ProfileListCard key={list.id} list={list} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* User's Favorites */}
            {profile.favorites !== null && (
              <TabsContent value="favorites">
                {profile.favorites.length === 0 ? (
                  <Empty className="border py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Heart className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No favorites yet</EmptyTitle>
                      <EmptyDescription>
                        This user hasn't favorited any lists.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {profile.favorites.map((list) => (
                      <ProfileFavoriteCard key={list.id} list={list} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </LandingLayout>
    </LanguageProvider>
  )
}

// Card for user's own lists
function ProfileListCard({
  list,
}: {
  list: PublicProfileData['lists'][number]
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to="/list/$listId" params={{ listId: list.id }} className="block">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg hover:text-primary transition-colors truncate">
            {list.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {list.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{list.itemCount} duas</span>
              <Badge variant="outline" className="text-xs">
                {list.language === 'my' ? 'BM' : 'EN'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {list.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {list.favoriteCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

// Card for user's favorited lists
function ProfileFavoriteCard({
  list,
}: {
  list: NonNullable<PublicProfileData['favorites']>[number]
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to="/list/$listId" params={{ listId: list.id }} className="block">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg hover:text-primary transition-colors truncate">
            {list.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {list.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{list.itemCount} duas</span>
              <Badge variant="outline" className="text-xs">
                {list.language === 'my' ? 'BM' : 'EN'}
              </Badge>
            </div>
            <span className="text-muted-foreground">by {list.authorName}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
