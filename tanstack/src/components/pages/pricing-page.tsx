import { ArrowRight, Check, HelpCircle, Star, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LANDING_CONTENT } from '@/lib/constants'

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

      {/* Pricing Cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {pricingContent.plans.map((plan, index) => (
              <div
                key={index}
                className={`relative pt-8 ${
                  plan.popular ? 'scale-105' : ''
                } transition-all duration-300`}
              >
                {plan.badge && (
                  <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white z-10">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                )}
                <Card
                  className={`p-8 rounded-2xl border h-full ${
                    plan.name === 'Free'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20'
                      : plan.popular
                      ? 'border-teal-500 shadow-lg shadow-teal-500/20'
                      : 'border-border hover:shadow-lg transition-all duration-300'
                  }`}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-serif font-medium text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-4">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start gap-3"
                      >
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}

                    {plan.excluded && plan.excluded.length > 0 && plan.excluded.map((excluded, excludedIndex) => (
                      <div
                        key={excludedIndex}
                        className="flex items-start gap-3 opacity-50"
                      >
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground line-through">
                          {excluded}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Button
                      className={`w-full ${
                        plan.name === 'Free'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : plan.popular
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white'
                          : ''
                      }`}
                      variant={plan.name === 'Free' || plan.popular ? 'default' : 'outline'}
                    >
                      {plan.name === 'Free' ? 'Get Started Free' : 'Get Started'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Free Forever Section */}
          <Card className="p-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-0 text-center">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-4">
                  Want to have unlimited access for free forever?
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Good news! GetDoa is open-source. You can earn unlimited access through:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-xl bg-white/50 dark:bg-black/20 border border-emerald-200 dark:border-emerald-700">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Code Contributions</h4>
                    <p className="text-sm text-muted-foreground">
                      Help improve GetDoa by contributing to our open-source codebase
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-white/50 dark:bg-black/20 border border-emerald-200 dark:border-emerald-700">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Add Prayers to Library</h4>
                    <p className="text-sm text-muted-foreground">
                      Help expand our prayer library by adding 3 authentic doa
                    </p>
                  </div>
                </div>
                <div className="relative p-6 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-200 dark:border-teal-800 mb-8 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors duration-300"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Already a Contributor?
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        If you've contributed to previous versions of GetDoa, you're eligible for unlimited access too! Your past contributions matter to us.
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Contact Us to Claim
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Email us at <a href="mailto:hazqeel@ellzaf.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline">hazqeel@ellzaf.com</a>
                </p>
              </div>
            </CardContent>
          </Card>

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
                      1 list
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Additional
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Additional
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
                  <td className="py-4 px-6 text-foreground">Fonts Customization</td>
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
              <Button asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/refund">View Refund Policy</a>
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
