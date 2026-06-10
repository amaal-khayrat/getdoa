import { Link, createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import {
  BookOpen,
  Download,
  Eye,
  Globe,
  Heart,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Gift,
  Trophy,
  Crown,
  Medal,
  Award,
  Users,
} from 'lucide-react'
import type { DoaListRecord } from '@/types/doa-list.types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { deleteDoaList, updateDoaList } from '@/server-functions/dashboard'
import { getLeaderboard, type LeaderboardEntry } from '@/server-functions/dashboard/referral'
import { useSession } from '@/lib/auth-client'

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    const leaderboard = await getLeaderboard({ data: { limit: 10 } })
    return { leaderboard: (leaderboard ?? []) as LeaderboardEntry[] }
  },
  component: DashboardIndex,
})

// Get parent dashboard route API for accessing loader data
const dashboardRoute = getRouteApi('/dashboard')

function DashboardIndex() {
  // lists comes from parent's loader
  const { lists } = dashboardRoute.useLoaderData()
  const { leaderboard } = Route.useLoaderData()
  const { listLimitInfo } = dashboardRoute.useRouteContext()
  const { data: session } = useSession()
  const user = session?.user
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState<DoaListRecord | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDeleteList = async () => {
    if (!listToDelete || !user) return

    startTransition(async () => {
      try {
        await deleteDoaList({
          data: { listId: listToDelete.id, userId: user.id },
        })
        setDeleteDialogOpen(false)
        setListToDelete(null)
        // Refresh data by navigating to same route
        navigate({ to: '/dashboard' })
      } catch (error) {
        console.error('Failed to delete list:', error)
      }
    })
  }

  const handleToggleVisibility = async (list: DoaListRecord) => {
    if (!user) return

    startTransition(async () => {
      try {
        const newVisibility =
          list.visibility === 'public' ? 'private' : 'public'
        await updateDoaList({
          data: {
            listId: list.id,
            userId: user.id,
            input: { visibility: newVisibility },
          },
        })
        navigate({ to: '/dashboard' })
      } catch (error) {
        console.error('Failed to update visibility:', error)
      }
    })
  }

  const handlePublish = async (list: DoaListRecord) => {
    if (!user) return

    startTransition(async () => {
      try {
        await updateDoaList({
          data: {
            listId: list.id,
            userId: user.id,
            input: { status: 'published' },
          },
        })
        navigate({ to: '/dashboard' })
      } catch (error) {
        console.error('Failed to publish:', error)
      }
    })
  }

  const isEmpty = lists.length === 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            My Prayer Lists
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              {isEmpty
                ? 'Create your first prayer list to get started'
                : `${lists.length} list${lists.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        <Link
          to="/onboarding"
          className={cn(buttonVariants(), 'gap-2')}
        >
          <Plus className="h-4 w-4" />
          Create List
        </Link>
      </div>

      {/* Lists Grid */}
      {isEmpty ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No prayer lists yet</EmptyTitle>
            <EmptyDescription>
              Create your first prayer list to start organizing your duas.
            </EmptyDescription>
          </EmptyHeader>
          <Link
            to="/onboarding"
            className={buttonVariants()}
          >
            Create Your First List
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onDelete={() => {
                setListToDelete(list)
                setDeleteDialogOpen(true)
              }}
              onToggleVisibility={() => handleToggleVisibility(list)}
              onPublish={() => handlePublish(list)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground">Referral Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top community members spreading the word</p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Invite friends to appear on the leaderboard!
              </p>
              <Button
                className="mt-4"
                variant="outline"
                render={<Link to="/dashboard/referrals" />}
              >
                <Gift className="h-4 w-4 mr-2" />
                Invite Friends
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <LeaderboardRow key={entry.rank} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{listToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              prayer list and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface ListCardProps {
  list: DoaListRecord & { itemCount: number }
  onDelete: () => void
  onToggleVisibility: () => void
  onPublish: () => void
  isPending: boolean
}

/** Style 1: pill badge with status dot */
function ListStatusPill({ status }: { status: 'published' | 'draft' }) {
  const published = status === 'published'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        published
          ? 'bg-primary/15 text-primary'
          : 'bg-muted text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          published ? 'bg-primary' : 'bg-muted-foreground/60',
        )}
        aria-hidden
      />
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

/** Horizontal rule only — same #E5E5E5 fade as before */
function ListCardOrnamentalDivider() {
  return (
    <div className="px-4" role="presentation" aria-hidden>
      <div
        className={cn(
          'h-px w-full',
          'bg-[linear-gradient(90deg,rgba(229,229,229,0.2),rgb(229,229,229)_50%,rgba(229,229,229,0.2))]',
          'dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.08))]',
        )}
      />
    </div>
  )
}

function ListCard({
  list,
  onDelete,
  onToggleVisibility,
  onPublish,
  isPending,
}: ListCardProps) {
  const prayerCount = list.itemCount

  const status = list.status === 'published' ? 'published' : 'draft'

  return (
    <Card className="group gap-0 overflow-hidden border border-border bg-background py-0 shadow-sm ring-0 transition-shadow hover:shadow-md">
      {/* Style 2: solid upper content (no gradient) */}
      <div className="px-4 pt-4 pb-3">
        {/* Row 1 — primary: title leads, then globe/lock + status pill; actions flush right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5">
            <Link
              to="/list/$listId"
              params={{ listId: list.id }}
              className="min-w-0 shrink"
            >
              <CardTitle className="text-xl font-bold leading-snug break-words transition-colors hover:text-primary">
                {list.name}
              </CardTitle>
            </Link>
            {list.visibility === 'public' ? (
              <Globe
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            ) : (
              <Lock
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            )}
            <ListStatusPill status={status} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-0.5 h-7 w-7 shrink-0 text-primary/60 hover:text-primary transition-colors"
                  disabled={isPending}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link to="/list/$listId" params={{ listId: list.id }} />}
                className="focus:text-primary"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:text-primary"
                render={
                  <Link
                    to="/dashboard/create-doa-list"
                    search={{ listId: list.id }}
                  />
                }
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {list.status === 'draft' && (
                <DropdownMenuItem onClick={onPublish} className="focus:text-primary">
                  <Eye className="h-4 w-4 mr-2 text-primary" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2 — secondary meta (single line, lighter than title) */}
        <p className="mt-2.5 text-xs leading-relaxed text-[#6B7280]">
          <span className="font-medium">{prayerCount} duas</span>
          <span className="mx-1.5 text-[#9CA3AF]">·</span>
          <span>
            Updated:{' '}
            {new Date(list.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </p>

        {/* Row 3 — optional body copy (tertiary, below meta, above divider) */}
        {list.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
            {list.description}
          </p>
        ) : null}
      </div>

      <ListCardOrnamentalDivider />

      {/* Row 4 — engagement stats (left) · visibility control (right), same band as Style 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-[16px] pb-[16px] pt-[8px]">
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
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

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-default" />}>
                <span
                  className="flex size-[18px] select-none items-center justify-center rounded-full border border-muted-foreground/35 text-[9px] font-semibold text-muted-foreground/70"
                  aria-label="Visibility info"
                >
                  i
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {list.visibility === 'public'
                  ? "This list is public — anyone on GetDoa can view it. The Copy List ID button is available for use in your website or app."
                  : "This list is private — only you can see it. Toggle to make it public and share it with others."}
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-muted-foreground">Public</span>
          </div>
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!isPending) onToggleVisibility()
            }}
          >
            <Switch
              checked={list.visibility === 'public'}
              disabled={isPending}
              size="sm"
              aria-label={
                list.visibility === 'public'
                  ? 'List is public. Toggle to make private.'
                  : 'List is private. Toggle to make public.'
              }
              className={cn(
                'border shadow-none',
                'data-unchecked:border-border/45 data-unchecked:bg-[#E5E5E5]',
                'dark:data-unchecked:border-border/50 dark:data-unchecked:bg-muted/50',
                'data-checked:border-transparent data-checked:bg-transparent',
                'data-checked:[background-image:var(--gradient-primary)]',
              )}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const { rank, displayName, referralCount } = entry

  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return null
    }
  }

  const topRankStyles: Record<number, string> = {
    1: 'border-yellow-300 dark:border-yellow-600 bg-linear-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20',
    2: 'border-gray-300 dark:border-gray-600 bg-linear-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20',
    3: 'border-amber-300 dark:border-amber-600 bg-linear-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-md', rank <= 3 && `border-2 ${topRankStyles[rank]}`)}>
      <CardContent className="flex items-center gap-3 py-3">
        <div className="flex w-10 items-center justify-center">
          {getRankIcon() ?? (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              #{rank}
            </Badge>
          )}
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {displayName === 'Anonymous' ? '?' : displayName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="flex-1 truncate text-sm font-medium">{displayName}</p>
        <div className="text-right">
          <p className="text-lg font-bold leading-none">{referralCount}</p>
          <p className="text-xs text-muted-foreground">{referralCount === 1 ? 'referral' : 'referrals'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
