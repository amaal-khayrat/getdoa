import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  getReferralStats,
  getUserReferralCode,
  getLeaderboardSettings,
  updateLeaderboardSettings,
  type ReferralStats,
  type LeaderboardSettings,
} from './dashboard/functions/referral'
import { getSessionFromServer, getUserListLimitInfo } from './dashboard/functions'
import { LIST_LIMIT_CONFIG, type ListLimitInfo } from '@/lib/list-limit'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Copy,
  Users,
  Gift,
  Share2,
  CheckCircle2,
  MessageCircle,
  Mail,
  ArrowRight,
  Loader2,
  ChevronDown,
  Trophy,
  Eye,
  EyeOff,
  ExternalLink,
  Crown,
  Sparkles,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/referrals')({
  loader: async () => {
    const session = await getSessionFromServer()
    if (!session?.user) throw redirect({ to: '/login' })

    const [codeResult, stats, leaderboardSettings, listLimitInfo] = await Promise.all([
      getUserReferralCode({ data: { userId: session.user.id } }),
      getReferralStats({ data: { userId: session.user.id, limit: 10 } }),
      getLeaderboardSettings({ data: { userId: session.user.id } }),
      getUserListLimitInfo({ data: { userId: session.user.id } }),
    ])

    return {
      user: session.user,
      code: codeResult?.code ?? null,
      initialStats: stats,
      initialLeaderboardSettings: leaderboardSettings,
      listLimitInfo,
    }
  },
  component: ReferralsPage,
  pendingComponent: ReferralsPageSkeleton,
  head: () => ({
    title: 'Invite Friends - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'Share GetDoa with friends and family',
      },
    ],
  }),
})

// ============================================
// Loading Skeleton
// ============================================
function ReferralsPageSkeleton() {
  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-96 mt-2" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

// ============================================
// Clipboard Helper with Fallback
// ============================================
async function copyToClipboard(text: string): Promise<boolean> {
  // Modern API
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for older browsers or when clipboard API fails
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch {
    return false
  }
}

// ============================================
// Main Page Component
// ============================================
function ReferralsPage() {
  const loaderData = Route.useLoaderData()
  const code = loaderData.code
  const initialStats = loaderData.initialStats as ReferralStats
  const initialLeaderboardSettings = loaderData.initialLeaderboardSettings as LeaderboardSettings | null
  const user = loaderData.user as { id: string; name: string; email: string; image: string | null }
  const listLimitInfo = loaderData.listLimitInfo as ListLimitInfo

  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<ReferralStats>(initialStats)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Build referral URL (safe for SSR)
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://getdoa.com'
  const referralUrl = code ? `${baseUrl}?ref=${code}` : ''

  // Handle copy with toast feedback
  const handleCopy = useCallback(async () => {
    if (!referralUrl) return

    const success = await copyToClipboard(referralUrl)

    if (success) {
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('Failed to copy. Please select and copy manually.')
    }
  }, [referralUrl])

  // Handle loading more referrals
  const handleLoadMore = useCallback(async () => {
    if (!stats.hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const moreStats = await getReferralStats({
        data: {
          userId: user.id,
          limit: 10,
          offset: stats.referrals.length,
        },
      })

      setStats((prev: ReferralStats) => ({
        ...moreStats,
        referrals: [...prev.referrals, ...moreStats.referrals],
      }))
    } catch {
      toast.error('Failed to load more referrals')
    } finally {
      setIsLoadingMore(false)
    }
  }, [stats, isLoadingMore, user.id])

  // Share handlers
  const handleShareWhatsApp = useCallback(() => {
    const text = `Assalamualaikum! I've been using GetDoa to organize my daily prayers. Try it out: ${referralUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }, [referralUrl])

  const handleShareEmail = useCallback(() => {
    const subject = 'Check out GetDoa - Prayer Companion App'
    const body = `Assalamualaikum!\n\nI've been using GetDoa to organize my daily prayers and create beautiful prayer lists. I thought you might like it too!\n\nJoin here: ${referralUrl}\n\nMay Allah bless you.`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }, [referralUrl])

  // Handle Web Share API (mobile)
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) {
      handleCopy()
      return
    }

    try {
      await navigator.share({
        title: 'GetDoa - Prayer Companion',
        text: "I've been using GetDoa for my daily prayers. Try it out!",
        url: referralUrl,
      })
    } catch (err) {
      // User cancelled or share failed - don't show error
      if ((err as Error).name !== 'AbortError') {
        handleCopy() // Fallback to copy
      }
    }
  }, [referralUrl, handleCopy])

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-semibold">Invite Friends</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Share GetDoa with friends and family. When they join using your link, you'll see them here!
        </p>
      </div>

      {/* How It Works - Simple Steps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
          <CardDescription>It's simple - just 3 steps!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium">1. Share Your Link</p>
              <p className="text-sm text-muted-foreground mt-1">
                Copy your personal link below and send it to friends
              </p>
            </div>

            {/* Arrow (hidden on mobile) */}
            <div className="hidden sm:flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background sm:col-start-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium">2. Friends Sign Up</p>
              <p className="text-sm text-muted-foreground mt-1">
                When they click your link and create an account
              </p>
            </div>

            {/* Arrow (hidden on mobile) */}
            <div className="hidden sm:flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background sm:col-start-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium">3. You're Connected!</p>
              <p className="text-sm text-muted-foreground mt-1">
                They appear in your list below. That's it!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Your Personal Invite Link
          </CardTitle>
          <CardDescription>
            Anyone who signs up using this link will be connected to you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link Input */}
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="font-mono text-sm bg-muted"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
              disabled={!code}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Native Share on mobile */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                variant="default"
                size="sm"
                onClick={handleNativeShare}
                className="sm:hidden"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Share via Email
            </Button>
          </div>

          {/* Code Display */}
          <p className="text-sm text-muted-foreground">
            Your unique code:{' '}
            <Badge variant="secondary" className="font-mono ml-1">
              {code ?? 'Loading...'}
            </Badge>
          </p>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends Who Joined
          </CardTitle>
          <CardDescription>
            People who signed up using your link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Total Count */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-bold">{stats.totalReferrals}</span>
            <span className="text-muted-foreground text-lg">
              {stats.totalReferrals === 1 ? 'friend' : 'friends'} joined
            </span>
          </div>

          {/* Referrals List or Empty State */}
          {stats.referrals.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
                {stats.totalReferrals <= 10 ? 'All Referrals' : 'Recent Joins'}
              </h4>
              <div className="space-y-3">
                {stats.referrals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.referredUserImage || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {r.referredUserName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {r.referredUserName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(r.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {stats.hasMore && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load More
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            /* Empty State - Encouraging */
            <div className="text-center py-8 px-4 rounded-lg bg-muted/30">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="font-medium text-lg mb-2">No friends yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Share your link above with friends and family. When they sign up
                for GetDoa, they'll appear here!
              </p>
              <Button
                onClick={handleCopy}
                className="mt-4"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Your Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* List Limit Bonus Breakdown */}
      <ListBonusBreakdownCard limitInfo={listLimitInfo} />

      {/* Leaderboard Settings */}
      <LeaderboardSettingsCard settings={initialLeaderboardSettings} userId={user.id} />

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">How do I share my link?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Copy the link above and send it via WhatsApp, email, or any messaging app.
              You can also share it on social media!
            </p>
          </div>
          <div>
            <p className="font-medium">When does someone count as my referral?</p>
            <p className="text-sm text-muted-foreground mt-1">
              When someone clicks your link and signs up for a GetDoa account, they'll
              automatically be counted as your referral.
            </p>
          </div>
          <div>
            <p className="font-medium">Is there a limit to how many people I can invite?</p>
            <p className="text-sm text-muted-foreground mt-1">
              No limit! Invite as many friends as you'd like. The more people using
              GetDoa, the better for our community.
            </p>
          </div>
          <div>
            <p className="font-medium">My friend signed up but they're not showing here?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure they used your specific link when signing up. If they went
              directly to the website without your link, we won't be able to connect you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// List Bonus Breakdown Card
// ============================================
function ListBonusBreakdownCard({ limitInfo }: { limitInfo: ListLimitInfo }) {
  const { MAX_REFERRAL_BONUS } = LIST_LIMIT_CONFIG
  const {
    breakdown,
    referralCount,
    referralPotential,
    hasSubscription,
  } = limitInfo

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Your List Limit
        </CardTitle>
        <CardDescription>How your list limit is calculated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Limit */}
        <div className="text-center p-4 rounded-lg bg-primary/5">
          <p className="text-sm text-muted-foreground">Total Lists Allowed</p>
          <p className="text-4xl font-bold mt-1">{limitInfo.limit}</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {/* Base */}
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Base allowance</span>
            <Badge variant="secondary">{breakdown.base}</Badge>
          </div>

          {/* Referrals */}
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <span className="text-muted-foreground">Referral bonus</span>
              <p className="text-xs text-muted-foreground">
                {referralCount} referral{referralCount === 1 ? '' : 's'}
                {referralCount >= MAX_REFERRAL_BONUS ? ' (max reached)' : ''}
              </p>
            </div>
            <Badge variant="default" className="bg-green-600">
              +{breakdown.referral}
            </Badge>
          </div>

          {/* Purchases (if any) */}
          {breakdown.purchase > 0 && (
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Purchased packs</span>
              <Badge variant="default" className="bg-blue-600">
                +{breakdown.purchase}
              </Badge>
            </div>
          )}

          {/* Subscription */}
          {hasSubscription ? (
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span>Subscription bonus</span>
              </div>
              <Badge variant="default">+{breakdown.subscription}</Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 border-b text-muted-foreground">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span>Subscription bonus</span>
              </div>
              <span className="text-xs">Coming soon</span>
            </div>
          )}
        </div>

        {/* Potential */}
        {referralPotential > 0 && (
          <div className="p-3 rounded-lg border border-dashed">
            <p className="text-sm text-center">
              <span className="text-muted-foreground">You can still earn </span>
              <span className="font-semibold text-primary">
                +{referralPotential} more
              </span>
              <span className="text-muted-foreground"> from referrals</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Leaderboard Settings Card
// ============================================
function LeaderboardSettingsCard({
  settings,
  userId,
}: {
  settings: LeaderboardSettings | null
  userId: string
}) {
  const [isVisible, setIsVisible] = useState(settings?.leaderboardVisible ?? true)
  const [displayPref, setDisplayPref] = useState(settings?.displayPreference ?? 'censored')
  const [previewName, setPreviewName] = useState(settings?.previewName ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleVisibilityChange = async (visible: boolean) => {
    setIsVisible(visible)
    await saveSettings(visible, displayPref)
  }

  const handleDisplayPrefChange = async (value: string | null) => {
    if (!value) return
    const pref = value as 'full' | 'censored' | 'anonymous'
    setDisplayPref(pref)
    await saveSettings(isVisible, pref)
  }

  const saveSettings = async (visible: boolean, pref: 'full' | 'censored' | 'anonymous') => {
    setIsSaving(true)
    try {
      await updateLeaderboardSettings({
        data: {
          userId,
          leaderboardVisible: visible,
          displayPreference: pref,
        },
      })

      // Update preview name based on new preference
      const newSettings = await getLeaderboardSettings({ data: { userId } })
      if (newSettings) {
        setPreviewName(newSettings.previewName)
      }

      toast.success('Leaderboard settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard Settings
        </CardTitle>
        <CardDescription>
          Control how you appear on the{' '}
          <a href="/leaderboard" className="text-primary hover:underline">
            public leaderboard
            <ExternalLink className="inline h-3 w-3 ml-1" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="leaderboard-visible" className="text-base">
              Show on Leaderboard
            </Label>
            <p className="text-sm text-muted-foreground">
              {isVisible
                ? 'You are visible on the public leaderboard'
                : 'You are hidden from the public leaderboard'}
            </p>
          </div>
          <Switch
            id="leaderboard-visible"
            checked={isVisible}
            onCheckedChange={handleVisibilityChange}
            disabled={isSaving}
          />
        </div>

        {/* Display Preference */}
        {isVisible && (
          <div className="space-y-3">
            <Label>Display Name Style</Label>
            <Select value={displayPref} onValueChange={handleDisplayPrefChange} disabled={isSaving}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Full Name</span>
                  </div>
                </SelectItem>
                <SelectItem value="censored">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Censored (e.g., J*** D**)</span>
                  </div>
                </SelectItem>
                <SelectItem value="anonymous">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span>Anonymous</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Preview */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {previewName === 'Anonymous' ? '?' : previewName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{previewName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Current Rank */}
        {settings?.currentRank && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-primary" />
            <span>
              Your current rank:{' '}
              <Badge variant="secondary">#{settings.currentRank}</Badge>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
