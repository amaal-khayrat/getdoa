import { createFileRoute } from '@tanstack/react-router'
import { getLeaderboard, type LeaderboardEntry } from './dashboard/functions/referral'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Users, Crown } from 'lucide-react'

export const Route = createFileRoute('/leaderboard')({
  loader: async () => {
    const leaderboard = await getLeaderboard({ data: { limit: 30 } })
    return { leaderboard }
  },
  component: LeaderboardPage,
  head: () => ({
    title: 'Referral Leaderboard - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'See the top referrers in the GetDoa community',
      },
    ],
  }),
})

function LeaderboardPage() {
  const loaderData = Route.useLoaderData()
  const leaderboard = (loaderData.leaderboard ?? []) as LeaderboardEntry[]

  return (
    <LandingLayout navbarVariant="doa">
      <div>
        {/* Hero Section */}
        <section className="py-16 md:py-20 bg-linear-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                <Trophy className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              Referral Leaderboard
            </h1>
            <p className="text-muted-foreground mt-4 text-lg md:text-xl max-w-xl mx-auto">
              Top community members who are spreading the word about GetDoa
            </p>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="py-12 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {leaderboard.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                  No referrals yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Be the first to invite friends and appear on the leaderboard!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <LeaderboardCard key={entry.rank} entry={entry} />
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-12 bg-linear-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-800">
            <CardHeader>
              <CardTitle className="text-lg font-serif">How to Join the Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-medium">1</span>
                <span>Sign in to GetDoa and go to "Invite Friends" in your dashboard</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-medium">2</span>
                <span>Share your unique referral link with friends and family</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-medium">3</span>
                <span>When they sign up, you'll climb the leaderboard!</span>
              </p>
              <p className="pt-3 text-xs border-t border-teal-200/50 dark:border-teal-800/50 mt-4">
                Your privacy matters. You can choose to appear anonymously or with a
                censored name in your settings.
              </p>
            </CardContent>
          </Card>
          </div>
        </section>
      </div>
    </LandingLayout>
  )
}

function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const { rank, displayName, referralCount } = entry

  // Rank styling
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBadge = () => {
    if (rank <= 3) {
      const colors: Record<number, string> = {
        1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        2: 'bg-gray-100 text-gray-800 border-gray-300',
        3: 'bg-amber-100 text-amber-800 border-amber-300',
      }
      return colors[rank]
    }
    return 'bg-muted text-muted-foreground'
  }

  const topRankStyles: Record<number, string> = {
    1: 'border-yellow-300 dark:border-yellow-600 bg-linear-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20',
    2: 'border-gray-300 dark:border-gray-600 bg-linear-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20',
    3: 'border-amber-300 dark:border-amber-600 bg-linear-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20',
  }

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 ${
        rank <= 3 ? `border-2 ${topRankStyles[rank]}` : ''
      }`}
    >
      <CardContent className="flex items-center gap-4 py-4">
        {/* Rank */}
        <div className="flex items-center justify-center w-12">
          {getRankIcon() || (
            <Badge variant="outline" className={getRankBadge()}>
              #{rank}
            </Badge>
          )}
        </div>

        {/* Avatar & Name */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {displayName === 'Anonymous' ? '?' : displayName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{displayName}</p>
        </div>

        {/* Count */}
        <div className="text-right">
          <p className="text-2xl font-bold">{referralCount}</p>
          <p className="text-xs text-muted-foreground">
            {referralCount === 1 ? 'referral' : 'referrals'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
