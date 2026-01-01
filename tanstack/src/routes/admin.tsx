import { createFileRoute, redirect, Link, useRouter } from '@tanstack/react-router'
import { getSessionFromServer } from './dashboard/functions'
import { isAdminEmail } from '@/lib/admin'
import {
  getAdminDashboardOverview,
  getActivityTimeline,
  type TimelineDataPoint,
} from './admin/functions'
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Users,
  TrendingUp,
  FileImage,
  Download,
  Heart,
  UserPlus,
  Activity,
  Calendar,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'
import { useCallback, useTransition } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export const Route = createFileRoute('/admin')({
  loader: async () => {
    // Check auth first
    const session = await getSessionFromServer()

    if (!session?.user) {
      throw redirect({ to: '/login' })
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      // Redirect to dashboard with no error message (security)
      throw redirect({ to: '/dashboard' })
    }

    // Load dashboard data
    const [overview, timeline] = await Promise.all([
      getAdminDashboardOverview(),
      getActivityTimeline({ data: { days: 30 } }),
    ])

    return {
      user: session.user,
      overview,
      timeline,
    }
  },
  component: AdminDashboard,
  pendingComponent: AdminDashboardSkeleton,
  errorComponent: AdminDashboardError,
  head: () => ({
    title: 'Admin Dashboard - GetDoa',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
})

// ============================================
// Error Component
// ============================================
function AdminDashboardError({ error }: { error: Error }) {
  const router = useRouter()

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader>
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Error Loading Dashboard</CardTitle>
          </div>
          <CardDescription>{error.message || 'An unexpected error occurred'}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={() => router.navigate({ to: '/dashboard' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
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
function AdminDashboardSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-b">
        <div className="container max-w-7xl px-4 py-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-6 w-96" />
        </div>
      </div>
      <div className="container max-w-7xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Stat Card Component
// ============================================
interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <Badge variant={trend.isPositive ? 'default' : 'secondary'} className="text-xs">
              {trend.isPositive ? '+' : ''}
              {trend.value}
            </Badge>
            <span className="text-muted-foreground text-xs">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Timeline Chart Component (using shadcn Chart)
// ============================================
interface TimelineChartProps {
  data: TimelineDataPoint[]
  dataKey: keyof Omit<TimelineDataPoint, 'date'>
  chartType?: 'area' | 'bar'
}

const chartConfig: ChartConfig = {
  activeUsers: {
    label: 'Active Users',
    color: 'var(--color-primary)',
  },
  newUsers: {
    label: 'New Users',
    color: 'var(--color-chart-2)',
  },
  exports: {
    label: 'Exports',
    color: 'var(--color-chart-3)',
  },
}

function TimelineChart({ data, dataKey, chartType = 'area' }: TimelineChartProps) {
  // Show last 14 days for cleaner display
  const recentData = data.slice(-14).map((point) => ({
    ...point,
    // Format date for display (MM/DD)
    displayDate: point.date.slice(5),
  }))

  // Handle empty data
  if (recentData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
        No data available
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-32 w-full">
      {chartType === 'bar' ? (
        <BarChart data={recentData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={30}
            allowDecimals={false}
          />
          <ChartTooltip
            content={<ChartTooltipContent labelFormatter={(label) => `Date: ${label}`} />}
          />
          <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[2, 2, 0, 0]} />
        </BarChart>
      ) : (
        <AreaChart data={recentData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={30}
            allowDecimals={false}
          />
          <ChartTooltip
            content={<ChartTooltipContent labelFormatter={(label) => `Date: ${label}`} />}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={`var(--color-${dataKey})`}
            fill={`var(--color-${dataKey})`}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      )}
    </ChartContainer>
  )
}

// ============================================
// Main Dashboard Component
// ============================================
function AdminDashboard() {
  const { overview, timeline, user } = Route.useLoaderData()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Use TanStack Router's invalidate for refresh
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.invalidate()
    })
  }, [router])

  // Safe percentage calculation
  const publicListPercentage =
    overview.content.totalLists > 0
      ? Math.round((overview.content.publicLists / overview.content.totalLists) * 100)
      : 0

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground mt-1">
                    Platform analytics and metrics overview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Logged in as</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container max-w-7xl space-y-8 px-4 py-8">
        {/* Active Users Section */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Activity className="text-primary h-5 w-5" />
            Active Users
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Daily Active Users (DAU)"
              value={overview.activeUsers.dau}
              description="Users active in last 24 hours"
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="Weekly Active Users (WAU)"
              value={overview.activeUsers.wau}
              description="Users active in last 7 days"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              title="Monthly Active Users (MAU)"
              value={overview.activeUsers.mau}
              description="Users active in last 30 days"
              icon={<BarChart3 className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* User Growth Section */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <TrendingUp className="text-primary h-5 w-5" />
            User Growth
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Users"
              value={overview.userGrowth.total}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="New Today"
              value={overview.userGrowth.newToday}
              icon={<UserPlus className="h-4 w-4" />}
              trend={{
                value: overview.userGrowth.newToday,
                label: 'today',
                isPositive: overview.userGrowth.newToday > 0,
              }}
            />
            <StatCard
              title="New This Week"
              value={overview.userGrowth.newThisWeek}
              icon={<UserPlus className="h-4 w-4" />}
            />
            <StatCard
              title="New This Month"
              value={overview.userGrowth.newThisMonth}
              icon={<UserPlus className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Activity Timeline */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <BarChart3 className="text-primary h-5 w-5" />
            Activity Timeline (Last 14 Days)
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineChart data={timeline} dataKey="activeUsers" chartType="area" />
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">New Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineChart data={timeline} dataKey="newUsers" chartType="bar" />
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm">Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineChart data={timeline} dataKey="exports" chartType="bar" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Content Stats Section */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <FileImage className="text-primary h-5 w-5" />
            Content Statistics
          </h2>
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard
              title="Total Doa Lists"
              value={overview.content.totalLists}
              icon={<FileImage className="h-4 w-4" />}
            />
            <StatCard
              title="Public Lists"
              value={overview.content.publicLists}
              description={`${publicListPercentage}% of total`}
              icon={<FileImage className="h-4 w-4" />}
            />
            <StatCard
              title="Total Exports"
              value={overview.content.totalExports}
              icon={<Download className="h-4 w-4" />}
            />
            <StatCard
              title="Exports Today"
              value={overview.content.exportsToday}
              icon={<Download className="h-4 w-4" />}
            />
            <StatCard
              title="Saved Duas"
              value={overview.content.totalSavedDoas}
              icon={<Heart className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* Referral Stats Section */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <UserPlus className="text-primary h-5 w-5" />
            Referral Statistics
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Referrals"
              value={overview.referrals.totalReferrals}
              icon={<UserPlus className="h-4 w-4" />}
            />
            <StatCard
              title="Referrals This Month"
              value={overview.referrals.referralsThisMonth}
              icon={<UserPlus className="h-4 w-4" />}
            />

            {/* Top Referrers Card */}
            <Card size="sm" className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Referrers</CardTitle>
                <CardDescription>Users with most referrals</CardDescription>
              </CardHeader>
              <CardContent>
                {overview.referrals.topReferrers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No referrals yet</p>
                ) : (
                  <div className="space-y-3">
                    {overview.referrals.topReferrers.slice(0, 5).map((referrer, i) => (
                      <div key={referrer.email} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="flex h-6 w-6 items-center justify-center rounded-full p-0"
                          >
                            {i + 1}
                          </Badge>
                          <div className="text-sm">
                            <p className="max-w-[150px] truncate font-medium">{referrer.name}</p>
                            <p className="text-muted-foreground max-w-[150px] truncate text-xs">
                              {referrer.email}
                            </p>
                          </div>
                        </div>
                        <Badge>{referrer.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-muted-foreground border-t pt-8 text-center text-sm">
          <p>Data generated at {new Date(overview.generatedAt).toLocaleString()}</p>
          <p className="mt-1">
            <Link to="/dashboard" className="text-primary hover:underline">
              Back to Dashboard
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
