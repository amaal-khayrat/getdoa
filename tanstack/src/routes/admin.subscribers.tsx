import { createFileRoute, redirect, Link, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { useCallback, useRef, useState, useTransition } from 'react'
import { checkAdminAuth, searchUserByEmail } from './admin/functions'
import {
  adminListSubscribers,
  adminGrantPremium,
  adminRevokePremium,
  type SubscriberInfo,
} from './dashboard/functions/subscription'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Crown,
  CreditCard,
  Gift,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Trash2,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

// Search params schema
const subscribersSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  filter: z.enum(['all', 'admin_granted', 'paid']).default('all'),
  search: z.string().optional(),
})

type SubscribersSearch = z.infer<typeof subscribersSearchSchema>

export const Route = createFileRoute('/admin/subscribers')({
  validateSearch: subscribersSearchSchema,
  beforeLoad: async () => {
    const authResult = await checkAdminAuth()

    if (!authResult.authenticated) {
      throw redirect({ to: '/login' })
    }

    if (!authResult.isAdmin) {
      throw redirect({ to: '/dashboard' })
    }

    return { user: authResult.user! }
  },
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
    search: search.search,
  }),
  loader: async ({ deps }) => {
    const result = await adminListSubscribers({
      data: {
        page: deps.page,
        limit: 20,
        filter: deps.filter,
        search: deps.search,
      },
    })

    if (!result.success) {
      throw new Error(result.error.message)
    }

    // Calculate stats from total counts (separate queries for accuracy)
    const [allResult, adminResult, paidResult] = await Promise.all([
      adminListSubscribers({ data: { page: 1, limit: 1, filter: 'all' } }),
      adminListSubscribers({ data: { page: 1, limit: 1, filter: 'admin_granted' } }),
      adminListSubscribers({ data: { page: 1, limit: 1, filter: 'paid' } }),
    ])

    return {
      subscribers: result.data,
      stats: {
        total: allResult.success ? allResult.data.total : 0,
        adminGranted: adminResult.success ? adminResult.data.total : 0,
        paid: paidResult.success ? paidResult.data.total : 0,
      },
    }
  },
  component: AdminSubscribersPage,
  pendingComponent: AdminSubscribersSkeleton,
  errorComponent: AdminSubscribersError,
  head: () => ({
    title: 'Manage Subscribers - Admin - GetDoa',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
})

// ============================================
// Error Component
// ============================================
function AdminSubscribersError({ error }: { error: Error }) {
  const router = useRouter()

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader>
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Error Loading Subscribers</CardTitle>
          </div>
          <CardDescription>{error.message || 'An unexpected error occurred'}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={() => router.navigate({ to: '/admin' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <Button onClick={() => router.invalidate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Loading Skeleton
// ============================================
function AdminSubscribersSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b">
        <div className="container max-w-7xl px-4 py-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-6 w-80" />
        </div>
      </div>
      <div className="container max-w-7xl space-y-6 px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

// ============================================
// Stat Card Component
// ============================================
interface StatCardProps {
  title: string
  value: number
  description?: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </CardContent>
    </Card>
  )
}

// ============================================
// Status Badge Component
// ============================================
function StatusBadge({ status, isAdminGranted }: { status: string; isAdminGranted: boolean }) {
  if (isAdminGranted) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Gift className="h-3 w-3" />
        Admin Granted
      </Badge>
    )
  }

  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    authenticated: 'default',
    pending: 'secondary',
    created: 'outline',
    halted: 'destructive',
    cancelled: 'destructive',
    expired: 'destructive',
    paused: 'secondary',
  }

  return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
}

// ============================================
// Grant Premium Dialog
// ============================================
function GrantPremiumDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [foundUser, setFoundUser] = useState<{ id: string; name: string; email: string } | null>(
    null,
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isGranting, setIsGranting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Ref to track mounted state for async operations
  const isMountedRef = useRef(true)

  const handleSearch = useCallback(async () => {
    if (!email.trim()) return

    setIsSearching(true)
    setError(null)
    setFoundUser(null)

    try {
      const result = await searchUserByEmail({ data: { email: email.trim() } })
      if (!isMountedRef.current) return

      if (result.found && result.user) {
        setFoundUser(result.user)
      } else {
        setError('No user found with this email')
      }
    } catch {
      if (isMountedRef.current) {
        setError('Failed to search user')
      }
    } finally {
      if (isMountedRef.current) {
        setIsSearching(false)
      }
    }
  }, [email])

  const handleGrant = useCallback(async () => {
    if (!foundUser) return

    setIsGranting(true)
    setError(null)

    try {
      const result = await adminGrantPremium({
        data: { targetUserId: foundUser.id, note: note.trim() || undefined },
      })
      if (!isMountedRef.current) return

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          if (isMountedRef.current) {
            setOpen(false)
            // Reset state
            setEmail('')
            setNote('')
            setFoundUser(null)
            setSuccess(false)
            onSuccess()
          }
        }, 1500)
      } else {
        setError(result.error.message)
      }
    } catch {
      if (isMountedRef.current) {
        setError('Failed to grant premium')
      }
    } finally {
      if (isMountedRef.current) {
        setIsGranting(false)
      }
    }
  }, [foundUser, note, onSuccess])

  // Reset state when dialog closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setEmail('')
      setNote('')
      setFoundUser(null)
      setError(null)
      setSuccess(false)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="mr-2 h-4 w-4" />
        Grant Premium
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Premium Access</DialogTitle>
          <DialogDescription>
            Search for a user by email and grant them free premium access.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="text-primary h-12 w-12" />
            <p className="mt-4 text-lg font-medium">Premium access granted!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFoundUser(null)
                    setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isSearching || !email.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {foundUser && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                      <Users className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{foundUser.name}</p>
                      <p className="text-muted-foreground text-sm">{foundUser.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {foundUser && (
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Reason for granting premium..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {error && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrant} disabled={!foundUser || isGranting}>
              {isGranting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Grant Premium
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Revoke Button Component
// ============================================
function RevokeButton({
  subscriber,
  onSuccess,
}: {
  subscriber: SubscriberInfo
  onSuccess: () => void
}) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const isMountedRef = useRef(true)

  const handleRevoke = useCallback(async () => {
    setIsRevoking(true)
    try {
      const result = await adminRevokePremium({ data: { targetUserId: subscriber.userId } })
      if (!isMountedRef.current) return

      if (result.success) {
        setShowConfirm(false)
        onSuccess()
      }
    } finally {
      if (isMountedRef.current) {
        setIsRevoking(false)
      }
    }
  }, [subscriber.userId, onSuccess])

  if (!subscriber.isAdminGranted) {
    return null
  }

  return (
    <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />
        }
      >
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke Premium Access</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke premium access from {subscriber.userName} (
            {subscriber.userEmail})?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRevoke} disabled={isRevoking}>
            {isRevoking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Main Page Component
// ============================================
function AdminSubscribersPage() {
  const { subscribers, stats } = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search.search || '')

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.invalidate()
    })
  }, [router])

  const handleSearch = useCallback(() => {
    navigate({
      search: (prev: SubscribersSearch) => ({
        ...prev,
        search: searchInput.trim() || undefined,
        page: 1,
      }),
    })
  }, [navigate, searchInput])

  const handleFilterChange = useCallback(
    (value: 'all' | 'admin_granted' | 'paid' | null) => {
      if (!value) return
      navigate({
        search: (prev: SubscribersSearch) => ({
          ...prev,
          filter: value,
          page: 1,
        }),
      })
    },
    [navigate],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      navigate({
        search: (prev: SubscribersSearch) => ({
          ...prev,
          page,
        }),
      })
    },
    [navigate],
  )

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-3xl font-bold">Manage Subscribers</h1>
                <p className="text-muted-foreground mt-1">
                  View and manage premium subscriptions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <GrantPremiumDialog onSuccess={handleRefresh} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl space-y-6 px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Subscribers"
            value={stats.total}
            description="All premium users"
            icon={<Crown className="h-4 w-4" />}
          />
          <StatCard
            title="Admin Granted"
            value={stats.adminGranted}
            description="Free premium access"
            icon={<Gift className="h-4 w-4" />}
          />
          <StatCard
            title="Paid Subscribers"
            value={stats.paid}
            description="Via Razorpay"
            icon={<CreditCard className="h-4 w-4" />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="w-64 pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>

          <Select value={search.filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subscribers</SelectItem>
              <SelectItem value="admin_granted">Admin Granted</SelectItem>
              <SelectItem value="paid">Paid Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscribers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <div className="text-muted-foreground">
                        <Users className="mx-auto h-8 w-8 opacity-50" />
                        <p className="mt-2">No subscribers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.items.map((subscriber) => (
                    <TableRow key={subscriber.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscriber.userName}</p>
                          <p className="text-muted-foreground text-sm">{subscriber.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={subscriber.status}
                          isAdminGranted={subscriber.isAdminGranted}
                        />
                      </TableCell>
                      <TableCell>
                        {subscriber.isAdminGranted ? (
                          <span className="text-muted-foreground text-sm">Admin Grant</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Paid</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {subscriber.currentPeriodEnd ? (
                          <span className="text-sm">
                            {new Date(subscriber.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {subscriber.adminGrantNote ? (
                          <span className="text-muted-foreground max-w-[200px] truncate text-sm">
                            {subscriber.adminGrantNote}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <RevokeButton subscriber={subscriber} onSuccess={handleRefresh} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {subscribers.total > subscribers.limit && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {(subscribers.page - 1) * subscribers.limit + 1} to{' '}
              {Math.min(subscribers.page * subscribers.limit, subscribers.total)} of{' '}
              {subscribers.total} subscribers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(subscribers.page - 1)}
                disabled={subscribers.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {subscribers.page} of {Math.ceil(subscribers.total / subscribers.limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(subscribers.page + 1)}
                disabled={!subscribers.hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-muted-foreground border-t pt-8 text-center text-sm">
          <Link to="/admin" className="text-primary hover:underline">
            Back to Admin Dashboard
          </Link>
        </footer>
      </div>
    </div>
  )
}
