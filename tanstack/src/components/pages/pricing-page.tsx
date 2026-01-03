import {
  ArrowRight,
  Check,
  HelpCircle,
  Star,
  X,
  Users,
  Gift,
  Sparkles,
  Plus,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LANDING_CONTENT } from '@/lib/constants'
import { LIST_LIMIT_CONFIG } from '@/lib/list-limit'

// Reusable component for contribution cards
function ContributionCard({
  icon,
  title,
  description,
  iconBgClass,
  iconTextClass,
}: {
  icon: React.ReactNode
  title: string
  description: string
  iconBgClass: string
  iconTextClass: string
}) {
  return (
    <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300 group">
      <div
        className={`w-14 h-14 rounded-xl ${iconBgClass} ${iconTextClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

// Component for existing contributor callout
function ContributorCallout() {
  return (
    <div className="bg-linear-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-2xl p-8 border border-teal-200 dark:border-teal-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 rounded-xl bg-white dark:bg-card shadow-lg flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-teal-600 dark:text-teal-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
          Already a Contributor?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
          If you've contributed to previous versions of GetDoa, you're eligible
          for unlimited access too! Your past contributions matter to us.
        </p>
        <Button className="bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          Contact Us to Claim
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Email us at{' '}
          <a
            href="mailto:hazqeel@ellzaf.com"
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline"
          >
            hazqeel@ellzaf.com
          </a>
        </p>
      </div>
    </div>
  )
}

export function PricingPage() {
  const pricingContent = LANDING_CONTENT.pages.pricing

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-gradient mb-6">
            {pricingContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            {pricingContent.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Main Plans: Free & Unlimited Access */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Free Plan */}
            {(() => {
              const freePlan = pricingContent.plans.find(
                (p) => p.name === 'Free',
              )
              if (!freePlan) return null
              return (
                <div className="relative pt-8">
                  <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white z-10">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Start Here
                  </Badge>
                  <Card className="p-8 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-serif font-medium text-foreground mb-2">
                          {freePlan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1 mb-4">
                          <span className="text-5xl font-bold text-foreground">
                            {freePlan.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {freePlan.period}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {freePlan.description}
                        </p>
                      </div>

                      <div className="flex-1 space-y-3 mb-8">
                        {freePlan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {freePlan.excluded?.map((excluded, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 opacity-50"
                          >
                            <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground line-through">
                              {excluded}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                          Get Started Free
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}

            {/* Unlimited Access Plan */}
            {(() => {
              const unlimitedPlan = pricingContent.plans.find(
                (p) => p.name === 'Unlimited Access',
              )
              if (!unlimitedPlan) return null
              return (
                <div className="relative pt-8">
                  <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white z-10">
                    <Star className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                  <Card className="p-8 rounded-2xl border-2 border-teal-500 shadow-lg shadow-teal-500/20 h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-serif font-medium text-foreground mb-2">
                          {unlimitedPlan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1 mb-4">
                          <span className="text-5xl font-bold text-foreground">
                            {unlimitedPlan.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {unlimitedPlan.period}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {unlimitedPlan.description}
                        </p>
                      </div>

                      <div className="flex-1 space-y-3 mb-8">
                        {unlimitedPlan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white">
                          Get Unlimited Access
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
          </div>

          {/* Referral Bonus Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 mb-16">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-serif">
                Earn Up to{' '}
                {LIST_LIMIT_CONFIG.BASE_LIMIT +
                  LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS}{' '}
                Free Doa Lists
              </CardTitle>
              <CardDescription className="text-base">
                Invite friends and grow your list limit for free
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 rounded-xl bg-background shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {LIST_LIMIT_CONFIG.BASE_LIMIT}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Base list (free)
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    +{LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    From referrals (max)
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background shadow-sm border-2 border-primary/20">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {LIST_LIMIT_CONFIG.BASE_LIMIT +
                      LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total possible
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  How It Works
                </h4>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-muted-foreground">
                      Share your unique referral link with friends
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-muted-foreground">
                      Friends sign up using your link
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-muted-foreground">
                      You earn +{LIST_LIMIT_CONFIG.BONUS_PER_REFERRAL} list per
                      referral (up to {LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS})
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  render={<a href="/dashboard/referrals" />}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Get Your Referral Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add-ons Section */}
          {/* <div className="mb-12">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Plus className="w-3 h-3 mr-1" />
                Add-ons
              </Badge>
              <h2 className="text-2xl font-serif font-medium text-foreground mb-2">
                Need More Lists?
              </h2>
              <p className="text-muted-foreground">
                Purchase additional doa lists one at a time
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"> */}
          {/* Basic Add-on */}
          {/* {(() => {
                const basicPlan = pricingContent.plans.find(p => p.name === 'Basic')
                if (!basicPlan) return null
                return (
                  <Card className="p-6 rounded-xl border hover:shadow-md transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-serif font-medium text-foreground">
                            {basicPlan.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {basicPlan.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-foreground">{basicPlan.price}</span>
                          <span className="text-xs text-muted-foreground block">{basicPlan.period}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {basicPlan.features.slice(1, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                        {basicPlan.excluded?.slice(0, 2).map((excluded, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm opacity-50">
                            <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground line-through">{excluded}</span>
                          </div>
                        ))}
                      </div>

                      <Button variant="outline" className="w-full" size="sm">
                        Add to Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })()} */}

          {/* Complete Add-on */}
          {/* {(() => {
                const completePlan = pricingContent.plans.find(p => p.name === 'Complete')
                if (!completePlan) return null
                return (
                  <div className="relative pt-4">
                    <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-teal-500 to-emerald-600 text-white text-xs z-10">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                    <Card className="p-6 rounded-xl border-2 border-teal-500/50 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-serif font-medium text-foreground">
                            {completePlan.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {completePlan.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-foreground">{completePlan.price}</span>
                          <span className="text-xs text-muted-foreground block">{completePlan.period}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {completePlan.features.slice(1, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                        {completePlan.excluded?.slice(0, 1).map((excluded, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm opacity-50">
                            <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground line-through">{excluded}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" size="sm">
                        Add to Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                    </Card>
                  </div>
                )
              })()}
            </div>
          </div> */}
        </div>
      </section>

      {/* Free Forever Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Want unlimited access for free forever?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              GetDoa is open-source. Earn unlimited access through:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <ContributionCard
              icon={
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              }
              title="Code Contributions"
              description="Help improve GetDoa by contributing to our open-source codebase"
              iconBgClass="bg-teal-50 dark:bg-teal-900/20"
              iconTextClass="text-teal-600 dark:text-teal-400"
            />

            <ContributionCard
              icon={
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title="Add Prayers to Library"
              description="Help expand our prayer library by adding 3 authentic doa"
              iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
              iconTextClass="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <ContributorCallout />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Compare All Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the perfect plan for your spiritual needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-medium text-foreground">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Basic
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Complete
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Unlimited Access
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">
                    Personalized Doa Lists
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      1-11 lists*
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +1 list
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +1 list
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Up to 50 lists
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">
                    Cloud Synchronization
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">
                    Background Images
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">
                    Fonts Customization
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">
                    Priority Support
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footnote for referral bonus */}
          <p className="text-sm text-muted-foreground mt-4 text-center">
            * Free users start with 1 list and can earn up to 10 additional
            lists through referrals.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {pricingContent.faq.map((faq, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              Still have questions? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button render={<a href="/contact" />}>Contact Support</Button>
              <Button render={<a href="/refund" />} variant="outline">
                View Refund Policy
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-6">
            Ready to Begin Your Spiritual Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Muslims who are deepening their connection with
            Allah through GetDoa.
          </p>
          <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700">
            Choose Your Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  )
}
