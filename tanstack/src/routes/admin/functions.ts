import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '@/db'
import { user, session, doaList, exportLog, referral, savedDoa } from '@/db/schema'
import { sql, desc, eq, gte, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'

// ============================================
// Auth + Admin Check Helper
// ============================================
async function requireAdminAuth() {
  const request = getRequest()
  const sessionData = await auth.api.getSession({ headers: request.headers })

  if (!sessionData?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  requireAdmin(sessionData.user.email)

  return sessionData
}

// ============================================
// Types
// ============================================
export interface ActiveUsersStats {
  dau: number // Daily Active Users
  wau: number // Weekly Active Users
  mau: number // Monthly Active Users
}

export interface UserGrowthStats {
  newToday: number
  newThisWeek: number
  newThisMonth: number
  total: number
}

export interface ContentStats {
  totalLists: number
  publicLists: number
  totalExports: number
  exportsToday: number
  totalSavedDoas: number
}

export interface ReferralStats {
  totalReferrals: number
  referralsThisMonth: number
  topReferrers: Array<{
    name: string
    email: string
    count: number
  }>
}

export interface DashboardOverview {
  activeUsers: ActiveUsersStats
  userGrowth: UserGrowthStats
  content: ContentStats
  referrals: ReferralStats
  generatedAt: string
}

export interface TimelineDataPoint {
  date: string // YYYY-MM-DD
  activeUsers: number
  newUsers: number
  exports: number
}

// ============================================
// Helper: Date calculations
// ============================================
function getDateRange(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// ============================================
// GET DASHBOARD OVERVIEW
// ============================================
export const getAdminDashboardOverview = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardOverview> => {
    await requireAdminAuth()

    const now = new Date()
    const oneDayAgo = getDateRange(1)
    const sevenDaysAgo = getDateRange(7)
    const thirtyDaysAgo = getDateRange(30)

    // Run all queries in parallel for performance
    const [
      dauResult,
      wauResult,
      mauResult,
      newTodayResult,
      newThisWeekResult,
      newThisMonthResult,
      totalUsersResult,
      totalListsResult,
      publicListsResult,
      totalExportsResult,
      exportsTodayResult,
      totalSavedDoasResult,
      totalReferralsResult,
      referralsThisMonthResult,
      topReferrersResult,
    ] = await Promise.all([
      // Active users (using session.updatedAt)
      db
        .select({ count: sql<number>`COUNT(DISTINCT ${session.userId})::int` })
        .from(session)
        .where(gte(session.updatedAt, oneDayAgo)),

      db
        .select({ count: sql<number>`COUNT(DISTINCT ${session.userId})::int` })
        .from(session)
        .where(gte(session.updatedAt, sevenDaysAgo)),

      db
        .select({ count: sql<number>`COUNT(DISTINCT ${session.userId})::int` })
        .from(session)
        .where(gte(session.updatedAt, thirtyDaysAgo)),

      // User growth (using user.createdAt)
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(user)
        .where(gte(user.createdAt, oneDayAgo)),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(user)
        .where(gte(user.createdAt, sevenDaysAgo)),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(user)
        .where(gte(user.createdAt, thirtyDaysAgo)),

      db.select({ count: sql<number>`COUNT(*)::int` }).from(user),

      // Content stats
      db.select({ count: sql<number>`COUNT(*)::int` }).from(doaList),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(doaList)
        .where(and(eq(doaList.status, 'published'), eq(doaList.visibility, 'public'))),

      db.select({ count: sql<number>`COUNT(*)::int` }).from(exportLog),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(exportLog)
        .where(gte(exportLog.exportedAt, oneDayAgo)),

      db.select({ count: sql<number>`COUNT(*)::int` }).from(savedDoa),

      // Referral stats
      db.select({ count: sql<number>`COUNT(*)::int` }).from(referral),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(referral)
        .where(gte(referral.createdAt, thirtyDaysAgo)),

      // Top referrers
      db
        .select({
          name: user.name,
          email: user.email,
          count: sql<number>`COUNT(${referral.id})::int`.as('count'),
        })
        .from(referral)
        .innerJoin(user, eq(referral.referrerId, user.id))
        .groupBy(user.id, user.name, user.email)
        .orderBy(desc(sql`count`))
        .limit(10),
    ])

    return {
      activeUsers: {
        dau: dauResult[0]?.count ?? 0,
        wau: wauResult[0]?.count ?? 0,
        mau: mauResult[0]?.count ?? 0,
      },
      userGrowth: {
        newToday: newTodayResult[0]?.count ?? 0,
        newThisWeek: newThisWeekResult[0]?.count ?? 0,
        newThisMonth: newThisMonthResult[0]?.count ?? 0,
        total: totalUsersResult[0]?.count ?? 0,
      },
      content: {
        totalLists: totalListsResult[0]?.count ?? 0,
        publicLists: publicListsResult[0]?.count ?? 0,
        totalExports: totalExportsResult[0]?.count ?? 0,
        exportsToday: exportsTodayResult[0]?.count ?? 0,
        totalSavedDoas: totalSavedDoasResult[0]?.count ?? 0,
      },
      referrals: {
        totalReferrals: totalReferralsResult[0]?.count ?? 0,
        referralsThisMonth: referralsThisMonthResult[0]?.count ?? 0,
        topReferrers: topReferrersResult.map((r) => ({
          name: r.name,
          email: r.email,
          count: r.count,
        })),
      },
      generatedAt: now.toISOString(),
    }
  },
)

// ============================================
// GET ACTIVITY TIMELINE (for charts)
// ============================================
export const getActivityTimeline = createServerFn({ method: 'GET' })
  .inputValidator((data: { days?: number }) => ({
    days: Math.min(Math.max(data.days ?? 30, 7), 90),
  }))
  .handler(async ({ data }): Promise<TimelineDataPoint[]> => {
    await requireAdminAuth()

    const { days } = data
    const startDate = getDateRange(days)

    // Type for raw SQL result
    type DateCountRow = { date: string; count: number }

    // Get daily active users
    const activeUsersResult = await db.execute<DateCountRow>(sql`
      SELECT
        TO_CHAR(${session.updatedAt}, 'YYYY-MM-DD') as date,
        COUNT(DISTINCT ${session.userId})::int as count
      FROM ${session}
      WHERE ${session.updatedAt} >= ${startDate}
      GROUP BY TO_CHAR(${session.updatedAt}, 'YYYY-MM-DD')
      ORDER BY date
    `)

    // Get daily new users
    const newUsersResult = await db.execute<DateCountRow>(sql`
      SELECT
        TO_CHAR(${user.createdAt}, 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM ${user}
      WHERE ${user.createdAt} >= ${startDate}
      GROUP BY TO_CHAR(${user.createdAt}, 'YYYY-MM-DD')
      ORDER BY date
    `)

    // Get daily exports
    const exportsResult = await db.execute<DateCountRow>(sql`
      SELECT
        TO_CHAR(${exportLog.exportedAt}, 'YYYY-MM-DD') as date,
        COUNT(*)::int as count
      FROM ${exportLog}
      WHERE ${exportLog.exportedAt} >= ${startDate}
      GROUP BY TO_CHAR(${exportLog.exportedAt}, 'YYYY-MM-DD')
      ORDER BY date
    `)

    // Merge into timeline (fill missing days with 0)
    const activeUsersMap = new Map(activeUsersResult.rows.map((r) => [r.date, r.count]))
    const newUsersMap = new Map(newUsersResult.rows.map((r) => [r.date, r.count]))
    const exportsMap = new Map(exportsResult.rows.map((r) => [r.date, r.count]))

    const timeline: TimelineDataPoint[] = []
    const currentDate = new Date(startDate)
    const today = new Date()

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0]
      timeline.push({
        date: dateStr,
        activeUsers: activeUsersMap.get(dateStr) ?? 0,
        newUsers: newUsersMap.get(dateStr) ?? 0,
        exports: exportsMap.get(dateStr) ?? 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return timeline
  })
