import { createFileRoute, getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import {
  Plus,
  BookOpen,
  MoreHorizontal,
  Eye,
  Download,
  Heart,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Gift,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
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
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { deleteDoaList, updateDoaList } from '@/server-functions/dashboard'
import type { DoaListRecord } from '@/types/doa-list.types'
import { useSession } from '@/lib/auth-client'
import { ListLimitIndicator } from '@/components/list/list-limit-indicator'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

// Get parent dashboard route API for accessing loader data
const dashboardRoute = getRouteApi('/dashboard')

function DashboardIndex() {
  // lists comes from parent's loader, listLimitInfo comes from parent's context (beforeLoad)
  const { lists } = dashboardRoute.useLoaderData()
  const { listLimitInfo } = dashboardRoute.useRouteContext()
  const { data: session } = useSession()
  const user = session?.user
  const canCreateMore = listLimitInfo?.canCreate ?? true
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
            {listLimitInfo && (
              <ListLimitIndicator limitInfo={listLimitInfo} variant="compact" />
            )}
          </div>
        </div>
        {canCreateMore ? (
          <Link
            to="/onboarding"
            className={cn(buttonVariants(), 'gap-2')}
          >
            <Plus className="h-4 w-4" />
            Create List
          </Link>
        ) : (
          <Button
            variant="outline"
            className="gap-2"
            render={<Link to="/dashboard/referrals" />}
          >
            <Gift className="h-4 w-4" />
            Invite to Unlock
          </Button>
        )}
      </div>

      {/* Limit reached banner */}
      {listLimitInfo && !listLimitInfo.canCreate && (
        <div className="mb-6 p-4 rounded-r-lg bg-background border border-border border-l-4 border-l-primary">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">List limit reached</p>
                <p className="text-sm text-muted-foreground">
                  {listLimitInfo.referralPotential > 0
                    ? `Invite ${listLimitInfo.referralPotential} more friend${listLimitInfo.referralPotential === 1 ? '' : 's'} to unlock more lists`
                    : 'Consider upgrading for more lists'}
                </p>
              </div>
            </div>
            <Button render={<Link to="/dashboard/referrals" />}>
              Invite Friends
            </Button>
          </div>
        </div>
      )}

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

function ListCard({
  list,
  onDelete,
  onToggleVisibility,
  onPublish,
  isPending,
}: ListCardProps) {
  const prayerCount = list.itemCount

  return (
    <Card className="group hover:shadow-md transition-shadow bg-card py-0 gap-0">
      {/* Green inset zone — own rounded corners, inset from card edges */}
      <div className="m-1 p-4 bg-secondary rounded-t-xl rounded-b-none">
        <div className="flex items-start justify-between gap-2">
          <Link to="/list/$listId" params={{ listId: list.id }} className="min-w-0 flex-1">
            <CardTitle className="text-xl font-bold hover:text-primary transition-colors truncate leading-snug">
              {list.name}
            </CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-primary/60 hover:text-primary transition-colors"
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

        {/* Typography hierarchy — duas (medium) · date (tertiary) */}
        <div className="flex items-baseline gap-1.5 mt-3">
          <span className="text-sm font-medium text-[#6B7280]">
            {prayerCount} duas
          </span>
          <span className="text-xs text-[#9CA3AF]">·</span>
          <span className="text-xs text-[#6B7280]">
            Updated {new Date(list.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {list.description && (
          <p className="text-sm text-[#6B7280] line-clamp-2 mt-2">
            {list.description}
          </p>
        )}
      </div>

      {/* White footer — badge + stats left · visibility toggle right */}
      <CardFooter className="pt-2 pb-3 px-3 flex items-center justify-between gap-2">
        {/* Left: status badge + stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium',
              list.status === 'published'
                ? 'bg-primary/10 border-primary/40 text-primary/70'
                : 'bg-muted border-muted-foreground/20 text-muted-foreground/60'
            )}
          >
            {list.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          <span className="w-px h-3.5 bg-border self-center shrink-0" aria-hidden />
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

        {/* Right: visibility label + toggle + help */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {list.visibility === 'public' ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {list.visibility === 'public' ? 'Public' : 'Private'}
          </span>
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
              aria-label="Toggle list visibility"
            />
          </div>
          <Tooltip>
            <TooltipTrigger render={<span className="cursor-default" />}>
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-white/90 text-[11px] font-bold select-none opacity-50"
                style={{ background: 'var(--gradient-primary)' }}
                aria-label="Visibility info"
              >
                ?
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {list.visibility === 'public'
                ? "This list is public — anyone on GetDoa can view it. The Copy List ID button is available for use in your website or app."
                : "This list is private — only you can see it. Toggle to make it public and share it with others."}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  )
}
