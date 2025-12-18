import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LANDING_CONTENT } from '@/lib/constants'

export function TermsPage() {
  const termsContent = LANDING_CONTENT.pages.terms

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-gradient mb-6">
            {termsContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {termsContent.hero.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {termsContent.lastUpdated}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-sm">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="space-y-12">
                  {termsContent.sections.map((section, index) => (
                    <div
                      key={index}
                      className="scroll-mt-24"
                      id={`section-${index + 1}`}
                    >
                      <h2 className="text-2xl font-serif font-medium text-foreground mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-sm font-medium">
                          {index + 1}
                        </span>
                        {section.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed pl-11">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Agreement Section */}
                <div className="mt-16 pt-8 border-t border-border">
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      By continuing to use GetDoa, you acknowledge that you have
                      read, understood, and agree to be bound by these terms.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Questions about our terms? We're here to help.
            </p>
            <Button asChild variant="ghost">
              <a href="/contact">Contact Support</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
