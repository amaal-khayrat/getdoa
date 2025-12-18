import { Link } from '@tanstack/react-router'
import { ArrowLeft, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/contexts/language-context'

export function DoaNotFound({ searchedSlug }: { searchedSlug?: string }) {
  const { language, t } = useLanguage()

  const suggestedPrayers = [
    { slug: 'penghulu-bagi-doa-keampunan', name: language === 'my' ? 'Penghulu Bagi Doa Keampunan' : 'The Master of Forgiveness Prayer' },
    { slug: 'pagi-doa-ditetapkan-islam', name: language === 'my' ? '[PAGI] Doa Ditetapkan Islam' : '[MORNING] Firmly Islam Doa' },
    { slug: 'doa-mohon-taqwa', name: language === 'my' ? 'Doa Mohon Taqwa' : 'Prayer for Taqwa' },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="p-8 text-center">
        {/* 404 Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {language === 'my' ? 'Doa Tidak Ditemui' : 'Prayer Not Found'}
          </h2>
        </div>

        {/* Error Message */}
        <div className="mb-8 max-w-md mx-auto">
          <p className="text-muted-foreground mb-4">
            {language === 'my'
              ? 'Maaf, doa yang anda cari tidak wujud dalam pangkalan data kami.'
              : 'Sorry, the prayer you are looking for does not exist in our database.'}
          </p>
          {searchedSlug && (
            <p className="text-sm text-muted-foreground">
              {language === 'my' ? `Slug yang dicari: "${searchedSlug}"` : `Searched slug: "${searchedSlug}"`}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="default"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'my' ? 'Kembali' : 'Go Back'}
          </Button>
          <Link to="/doa">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {language === 'my' ? 'Cari Doa Lain' : 'Search Other Prayers'}
            </Button>
          </Link>
        </div>

        {/* Suggested Prayers */}
        <div className="text-left">
          <h3 className="font-semibold text-foreground mb-4 text-center">
            {language === 'my' ? 'Doa Popular' : 'Popular Prayers'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
            {suggestedPrayers.map((prayer) => (
              <Link
                key={prayer.slug}
                to="/doa/$slug"
                params={{ slug: prayer.slug }}
                className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                  {prayer.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === 'my' ? 'Klik untuk melihat doa' : 'Click to view prayer'}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">
            {language === 'my' ? 'Perlu Bantuan?' : 'Need Help?'}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {language === 'my'
              ? 'Jika anda merasa ini adalah ralat, sila hubungi kami.'
              : 'If you believe this is an error, please contact us.'}
          </p>
          <Link to="/contact">
            <Button variant="ghost" size="sm">
              {language === 'my' ? 'Hubungi Kami' : 'Contact Us'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}