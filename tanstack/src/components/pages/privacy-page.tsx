import { Cookie, CreditCard, Eye, Lock, Shield, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LANDING_CONTENT } from '@/lib/constants'

// Icon mapping for privacy sections
const iconMap = {
  shield: Shield,
  lock: Lock,
  eye: Eye,
  creditCard: CreditCard,
  userRight: User,
  cookie: Cookie,
}

export function PrivacyPage() {
  const privacyContent = LANDING_CONTENT.pages.privacy

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Map sections to icons based on content
  const getIconForSection = (title: string) => {
    const iconKeys: { [key: string]: keyof typeof iconMap } = {
      'Data Collection': 'shield',
      'Information Usage': 'eye',
      'Data Security': 'lock',
      'Payment Processing': 'creditCard',
      'User Rights': 'userRight',
      'Cookies and Tracking': 'cookie',
    }
    return iconKeys[title] ?? 'shield'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
              <Shield className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-gradient mb-6">
            {privacyContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {privacyContent.hero.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {privacyContent.lastUpdated}
          </p>
        </div>
      </section>

      {/* Privacy Commitment Banner */}
      <section className="py-12 bg-teal-50 dark:bg-teal-950/30 border-y border-teal-200 dark:border-teal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-medium text-teal-800 dark:text-teal-200">
            Your privacy is our priority. We never sell your data and only
            collect what's necessary to provide our services.
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {privacyContent.sections.map((section, index) => {
              const IconComponent = iconMap[getIconForSection(section.title)]

              return (
                <Card
                  key={index}
                  className="shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-serif font-medium text-foreground mb-3">
                          {section.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
              <CardContent className="p-0">
                <Lock className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">
                  256-bit Encryption
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bank-level security for your data
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-0">
                <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">
                  GDPR Compliant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Following international data protection standards
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-0">
                <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">
                  PCI DSS Compliant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure payment processing through Razorpay
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Section */}
          <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-serif font-medium text-foreground mb-4">
              Your Data, Your Rights
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              You have the right to access, update, or delete your personal
              information at any time. Contact us and we'll respond within 24
              hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={scrollToTop} variant="outline">
                Back to Top
              </Button>
              <Button asChild>
                <a href="/contact">Exercise Your Rights</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
