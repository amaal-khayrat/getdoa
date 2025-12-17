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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingContent.plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'border-teal-500 shadow-lg shadow-teal-500/20 scale-105'
                    : 'border-border hover:shadow-lg transition-all duration-300'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}

                <CardContent className="p-0">
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
                  <div className="space-y-3 mb-8">
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

                    {plan.excluded.map((excluded, excludedIndex) => (
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
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    Basic
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Premium
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Bundle
                  </th>
                  <th className="text-center py-4 px-6 font-medium text-foreground">
                    Pro
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
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      1 list
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      50 lists
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">
                    Custom Backgrounds
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
                  <td className="py-4 px-6 text-center">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-foreground">Premium Fonts</td>
                  <td className="py-4 px-6 text-center">
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
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
                  <td className="py-4 px-6 text-foreground">Cloud Sync</td>
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
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
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
