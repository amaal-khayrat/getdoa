import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LANDING_CONTENT } from '@/lib/constants'

export function RefundPage() {
  const refundContent = LANDING_CONTENT.pages.refund

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Clock className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-gradient mb-6">
            {refundContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {refundContent.hero.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {refundContent.lastUpdated}
          </p>
        </div>
      </section>

      {/* Refund Promise Banner */}
      <section className="py-12 bg-emerald-50 dark:bg-emerald-950/30 border-y border-emerald-200 dark:border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
            <span className="font-bold">14-Day Guarantee:</span> Full refund if
            you haven't used any paid features
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Eligibility Section */}
        <Card className="mb-12 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-medium text-foreground">
                {refundContent.eligibility.title}
              </h2>
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {refundContent.eligibility.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {refundContent.eligibility.criteria.map((criterion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{criterion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Timeline */}
        <Card className="mb-12 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ArrowRight className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-medium text-foreground">
                {refundContent.process.title}
              </h2>
            </div>

            <div className="space-y-6">
              {refundContent.process.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Information */}
        <Card className="mb-12 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-medium text-foreground">
                {refundContent.timeline.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {refundContent.timeline.description}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {refundContent.timeline.note}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-serif font-medium text-foreground mb-4">
              Ready to Request a Refund?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're here to help. Contact our support team and we'll guide you
              through the refund process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
                asChild
              >
                <a href="mailto:hazqeel@ellzaf.com">Email Support Team</a>
              </Button>
              <Button onClick={scrollToTop} variant="outline">
                Back to Top
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
