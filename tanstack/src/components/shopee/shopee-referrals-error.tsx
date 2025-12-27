import { AlertCircle, ShoppingBag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

interface ShopeeReferralsErrorProps {
  error?: Error
  onRetry?: () => void
}

export function ShopeeReferralsError({ error, onRetry }: ShopeeReferralsErrorProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: 'Shop & Support Us',
      errorTitle: 'Unable to load products',
      errorMessage: error?.message || 'Something went wrong while loading the products.',
      retryButton: 'Try again',
      productUnavailable: 'Product unavailable',
      viewOnShopee: 'View on Shopee',
    },
    my: {
      title: 'Belian & Sokong Kami',
      errorTitle: 'Produk tidak dapat dimuatkan',
      errorMessage: error?.message || 'Sesuatu tidak kena semasa memuatkan produk.',
      retryButton: 'Cuba lagi',
      productUnavailable: 'Produk tidak tersedia',
      viewOnShopee: 'Lihat di Shopee',
    },
  }

  const t = translations[language]

  return (
    <section className="mt-8">
      <div className="flex items-center space-x-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
      </div>

      <Card className="p-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <div className="flex flex-col items-center text-center py-4">
          <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400 mb-3" />
          <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
            {t.errorTitle}
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-300 mb-4 max-w-sm">
            {t.errorMessage}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
            >
              {t.retryButton}
            </Button>
          )}
        </div>
      </Card>
    </section>
  )
}
