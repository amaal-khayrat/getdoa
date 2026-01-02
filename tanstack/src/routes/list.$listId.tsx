import { createFileRoute, notFound, Link, useNavigate } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { BookOpen, Heart, Share2, Copy, Eye, Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  getDoaList,
  getSessionFromServer,
  isListFavorited,
  addFavoriteList,
  removeFavoriteList,
  logExport,
} from '@/routes/dashboard/functions'
import { fetchShopeeReferrals } from '@/utils/shopee-fetch.server'
import { generateDoaImage, downloadImage } from '@/utils/image-generator'
import type { DoaList, TranslationLayout } from '@/types/doa.types'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { LanguageProvider, useLanguage } from '@/contexts/language-context'
import { ShopeeReferralsSection } from '@/components/shopee/shopee-referrals-section'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ListExportPreviewModal,
  type ExportSettings,
} from '@/components/list/list-export-preview-modal'
import type { DoaListWithUserAndItems } from '@/types/doa-list.types'
import type { Doa } from '@/types/doa.types'
import type { ShopeeOgData } from '@/types/shopee.types'

export const Route = createFileRoute('/list/$listId')({
  // Data loading - runs on server
  loader: async ({ params }) => {
    // Run in parallel for performance
    // Use Promise.allSettled for shopee so failure doesn't break the page
    const [listResult, sessionResult, shopeeResult] = await Promise.allSettled([
      getDoaList({ data: { listId: params.listId } }),
      getSessionFromServer(),
      fetchShopeeReferrals({ count: 8 }),
    ])

    // List is required - throw if failed
    if (listResult.status === 'rejected') {
      throw listResult.reason
    }
    const list = listResult.value

    if (!list) {
      throw notFound()
    }

    // Session is optional but shouldn't fail silently
    const session = sessionResult.status === 'fulfilled' ? sessionResult.value : null

    // Shopee referrals are optional - use empty array on failure
    // Map to only include url and ogData (component doesn't need error field)
    const shopeeReferrals =
      shopeeResult.status === 'fulfilled'
        ? shopeeResult.value.map(({ url, ogData }) => ({ url, ogData }))
        : []

    // Check favorite status if authenticated (needs list first to check ownership)
    let isFavorited = false
    if (session?.user && list.userId !== session.user.id) {
      const { isFavorited: favorited } = await isListFavorited({
        data: { userId: session.user.id, listId: params.listId },
      })
      isFavorited = favorited
    }

    // Extract prayers from items (already ordered and resolved with doa)
    const prayers = list.items.map((item) => item.doa)

    return {
      list,
      prayers,
      isAuthenticated: !!session?.user,
      userId: session?.user?.id,
      isFavorited,
      shopeeReferrals,
    }
  },
  component: PublicListPage,
  head: ({ loaderData }) => {
    if (!loaderData?.list) {
      return {
        title: 'List Not Found - GetDoa',
        meta: [
          {
            name: 'description',
            content: 'The requested prayer list could not be found.',
          },
        ],
      }
    }

    const { list, prayers } = loaderData
    const prayerCount = prayers.length
    const title = `${list.name} by ${list.user.name} - GetDoa`
    const description =
      list.description || `A prayer list with ${prayerCount} duas`

    return {
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `https://getdoa.com/list/${list.id}` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'robots', content: 'index, follow' },
      ],
    }
  },
  notFoundComponent: () => (
    <LanguageProvider>
      <LandingLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-semibold mb-4">
            List Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This prayer list doesn't exist or is private.
          </p>
          <Link to="/doa" className={buttonVariants()}>
            Browse Doa Library
          </Link>
        </div>
      </LandingLayout>
    </LanguageProvider>
  ),
})

function PublicListPage() {
  const {
    list,
    prayers,
    isAuthenticated,
    userId,
    isFavorited: initialFavorited,
    shopeeReferrals,
  } = Route.useLoaderData()

  return (
    <LanguageProvider>
      <LandingLayout navbarVariant="doa">
        <PublicListView
          list={list}
          prayers={prayers}
          isAuthenticated={isAuthenticated}
          userId={userId}
          initialFavorited={initialFavorited}
          shopeeReferrals={shopeeReferrals}
        />
      </LandingLayout>
    </LanguageProvider>
  )
}

interface PublicListViewProps {
  list: DoaListWithUserAndItems
  prayers: Doa[]
  isAuthenticated: boolean
  userId?: string
  initialFavorited: boolean
  shopeeReferrals: Array<{ url: string; ogData?: ShopeeOgData }>
}

function PublicListView({
  list,
  prayers,
  isAuthenticated,
  userId,
  initialFavorited,
  shopeeReferrals,
}: PublicListViewProps) {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  // Optimistic state for favorite
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [favoriteCount, setFavoriteCount] = useState(list.favoriteCount)

  // Image export state
  const [isExporting, setIsExporting] = useState(false)

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false)
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    showTranslations: list.showTranslations,
    translationLayout: list.translationLayout as TranslationLayout,
  })

  // Is this the user's own list?
  const isOwnList = userId === list.userId

  const handleToggleFavorite = () => {
    if (!isAuthenticated || !userId) {
      toast.info('Please sign in to save lists')
      navigate({ to: '/login' })
      return
    }

    if (isOwnList) {
      toast.error("You can't favorite your own list")
      return
    }

    const wasFavorited = isFavorited

    // Optimistic update
    setIsFavorited(!wasFavorited)
    setFavoriteCount((prev) => (wasFavorited ? prev - 1 : prev + 1))

    startTransition(async () => {
      try {
        if (wasFavorited) {
          await removeFavoriteList({ data: { userId, listId: list.id } })
          toast.success('Removed from saved lists')
        } else {
          await addFavoriteList({ data: { userId, listId: list.id } })
          toast.success('Added to saved lists')
        }
      } catch {
        // Rollback
        setIsFavorited(wasFavorited)
        setFavoriteCount((prev) => (wasFavorited ? prev + 1 : prev - 1))
        toast.error('Failed to update. Please try again.')
      }
    })
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `${list.name} - A prayer list with ${prayers.length} duas`

    if (navigator.share) {
      try {
        await navigator.share({
          title: list.name,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      toast.success('Link copied to clipboard')
    }
  }

  const copyPrayers = () => {
    const text = prayers
      .map((p) => {
        const name = language === 'my' ? p.nameMy : p.nameEn
        const meaning = language === 'my' ? p.meaningMy : p.meaningEn
        return `${name}\n${p.content}\n${meaning}`
      })
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Prayers copied to clipboard')
  }

  const handleExportImage = async (settings?: ExportSettings) => {
    if (prayers.length === 0) {
      toast.error('This list has no prayers to export')
      return
    }

    // Use provided settings or fall back to current exportSettings
    const useSettings = settings || exportSettings

    setIsExporting(true)

    try {
      // Build DoaList object for image generator
      const doaList: DoaList = {
        title: list.name,
        description: list.description || '',
        prayers: prayers.map((p) => ({
          ...p,
          // DoaItem requires these fields
          slug: p.slug,
          content: p.content,
          nameEn: p.nameEn,
          nameMy: p.nameMy,
          meaningEn: p.meaningEn,
          meaningMy: p.meaningMy,
          referenceEn: p.referenceEn,
          referenceMy: p.referenceMy,
          categoryNames: p.categoryNames,
        })),
        language: list.language as 'en' | 'my',
        showTranslations: useSettings.showTranslations,
        translationLayout: useSettings.translationLayout,
        createdBy: list.user.name,
        createdAt: new Date(list.createdAt),
      }

      // Generate the image
      const blob = await generateDoaImage({
        doaList,
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a',
        minImageWidth: 1080,
        maxImageWidth: 3000,
      })

      // Download the image
      const filename = `${list.name.replace(/[^a-z0-9]/gi, '_')}_getdoa.png`
      downloadImage(blob, filename)

      // Log the export for tracking
      await logExport({ data: { listId: list.id, userId } })

      toast.success('Image downloaded successfully!')
      setShowPreview(false) // Close preview after successful export
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export image. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/lists" className="hover:text-foreground transition-colors">
          Lists
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-50">
          {list.name}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">
          {list.name}
        </h1>

        {list.description && (
          <p className="text-muted-foreground text-lg mb-4">
            {list.description}
          </p>
        )}

        {/* Author info - Links to profile */}
        <Link
          to="/user/$userId"
          params={{ userId: list.userId }}
          className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity w-fit"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={list.user.image || ''} alt={list.user.name} />
            <AvatarFallback>{getInitials(list.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground hover:text-primary transition-colors">
              {list.user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {prayers.length} duas
            </p>
          </div>
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {list.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {list.exportCount} exports
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" /> {favoriteCount} favorites
          </span>
        </div>

        {/* Settings badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline">
            {list.language === 'my' ? 'Bahasa Malaysia' : 'English'}
          </Badge>
          {list.showTranslations && (
            <Badge variant="outline">
              {list.translationLayout === 'grouped'
                ? 'Grouped translations'
                : 'Interleaved translations'}
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {!isOwnList && (
          <Button
            variant={isFavorited ? 'default' : 'outline'}
            onClick={handleToggleFavorite}
            disabled={isPending}
            className={isFavorited ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Heart
              className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`}
            />
            {isFavorited ? 'Saved' : 'Save'} ({favoriteCount})
          </Button>
        )}
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          disabled={prayers.length === 0}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview & Export
        </Button>
        <Button variant="outline" onClick={copyPrayers}>
          <Copy className="h-4 w-4 mr-2" />
          Copy All
        </Button>
      </div>

      {/* Prayers List */}
      <div className="space-y-6">
        {prayers.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              This list doesn't have any prayers yet.
            </p>
          </Card>
        ) : (
          prayers.map((prayer, index) => (
            <PrayerCard
              key={prayer.slug}
              prayer={prayer}
              index={index + 1}
              language={language}
              showTranslations={list.showTranslations}
            />
          ))
        )}
      </div>

      {/* Footer CTA - Only for unauthenticated users */}
      {!isAuthenticated && (
        <div className="mt-12 text-center">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-2">
              Create Your Own Prayer List
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign up for free and start building your personalized doa
              collection.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login" className={buttonVariants()}>
                Get Started
              </Link>
              <Link to="/doa" className={buttonVariants({ variant: 'outline' })}>
                Browse Duas
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Shopee Referrals - loaded from server */}
      <ShopeeReferralsSection referrals={shopeeReferrals} />

      {/* Export Preview Modal */}
      <ListExportPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        listName={list.name}
        prayers={prayers}
        language={language}
        settings={exportSettings}
        onSettingsChange={setExportSettings}
        onExport={() => handleExportImage(exportSettings)}
        isExporting={isExporting}
      />
    </div>
  )
}

interface PrayerCardProps {
  prayer: Doa
  index: number
  language: 'en' | 'my'
  showTranslations: boolean
}

function PrayerCard({
  prayer,
  index,
  language,
  showTranslations,
}: PrayerCardProps) {
  const name = language === 'my' ? prayer.nameMy : prayer.nameEn
  const meaning = language === 'my' ? prayer.meaningMy : prayer.meaningEn
  const reference =
    language === 'my' ? prayer.referenceMy : prayer.referenceEn

  const copyToClipboard = () => {
    const text = `${name}\n${prayer.content}\n${meaning}`
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {index}
          </span>
          <div>
            <Link
              to="/doa/$slug"
              params={{ slug: prayer.slug }}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {name}
            </Link>
            <p className="text-sm text-muted-foreground">{reference}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Arabic text */}
      <div className="text-right mb-4">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-2xl leading-relaxed text-foreground"
        >
          {prayer.content}
        </p>
      </div>

      {/* Translation */}
      {showTranslations && (
        <p className="text-muted-foreground leading-relaxed">{meaning}</p>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mt-4">
        {prayer.categoryNames.slice(0, 3).map((category, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {category}
          </Badge>
        ))}
      </div>
    </Card>
  )
}
