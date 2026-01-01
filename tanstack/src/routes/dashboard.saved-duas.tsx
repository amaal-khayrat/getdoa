import { useState, useTransition, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, Trash2, Copy } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getSavedDoas, unsaveDoa } from './dashboard/functions'
import { getDoasBySlugs } from './dashboard/functions/doa'
import { useLanguage } from '@/contexts/language-context'
import { useSession } from '@/lib/auth-client'
import type { SavedDoaRecord } from '@/types/doa-list.types'
import type { Doa } from '@/types/doa.types'

export const Route = createFileRoute('/dashboard/saved-duas')({
  loader: async () => {
    // Data will be loaded client-side using useSession
    return {}
  },
  component: SavedDuasPage,
  head: () => ({
    title: 'Saved Duas - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'View and manage your saved individual duas.',
      },
    ],
  }),
})

function SavedDuasPage() {
  const { data: session } = useSession()
  const { language } = useLanguage()
  const [, setSavedDoas] = useState<SavedDoaRecord[]>([])
  const [enrichedDoas, setEnrichedDoas] = useState<
    Array<{ saved: SavedDoaRecord; doa: Doa }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [doaToDelete, setDoaToDelete] = useState<SavedDoaRecord | null>(null)
  const [isPending, startTransition] = useTransition()

  const user = session?.user

  // Load saved duas on mount and enrich with doa data
  useEffect(() => {
    async function loadSavedDoas() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const saved = await getSavedDoas({ data: { userId: user.id } })
        setSavedDoas(saved)

        // Fetch full doa data for the saved slugs
        if (saved.length > 0) {
          const slugs = saved.map((s) => s.doaSlug)
          const doaData = await getDoasBySlugs({ data: { slugs } })

          // Create a map for quick lookup
          const doaMap = new Map(doaData.map((d) => [d.slug, d]))

          // Enrich saved doas with full data
          const enriched = saved
            .map((s) => {
              const doa = doaMap.get(s.doaSlug)
              return doa ? { saved: s, doa } : null
            })
            .filter(
              (item): item is { saved: SavedDoaRecord; doa: Doa } =>
                item !== null,
            )

          setEnrichedDoas(enriched)
        }
      } catch (error) {
        console.error('Failed to load saved duas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedDoas()
  }, [user])

  const handleUnsaveDoa = async () => {
    if (!doaToDelete || !user) return

    startTransition(async () => {
      try {
        await unsaveDoa({
          data: { userId: user.id, doaSlug: doaToDelete.doaSlug },
        })
        setSavedDoas((prev) => prev.filter((d) => d.id !== doaToDelete.id))
        setEnrichedDoas((prev) =>
          prev.filter((item) => item.saved.id !== doaToDelete.id),
        )
        setDeleteDialogOpen(false)
        setDoaToDelete(null)
      } catch (error) {
        console.error('Failed to unsave doa:', error)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            Saved Duas
          </h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  const isEmpty = enrichedDoas.length === 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Saved Duas
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEmpty
            ? 'Save individual duas for quick access'
            : `${enrichedDoas.length} saved dua${enrichedDoas.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Duas Grid */}
      {isEmpty ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No saved duas yet</EmptyTitle>
            <EmptyDescription>
              Browse the doa library and save your favorite prayers for quick
              access.
            </EmptyDescription>
          </EmptyHeader>
          <Link to="/doa" className={buttonVariants()}>
            Browse Doa Library
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {enrichedDoas.map(({ saved, doa }) => (
            <SavedDoaCard
              key={saved.id}
              doa={doa}
              language={language}
              onRemove={() => {
                setDoaToDelete(saved)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from saved?</AlertDialogTitle>
            <AlertDialogDescription>
              This dua will be removed from your saved collection. You can
              always save it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsaveDoa}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface SavedDoaCardProps {
  doa: Doa
  language: 'en' | 'my'
  onRemove: () => void
}

function SavedDoaCard({ doa, language, onRemove }: SavedDoaCardProps) {
  const name = language === 'my' ? doa.nameMy : doa.nameEn
  const meaning = language === 'my' ? doa.meaningMy : doa.meaningEn
  const reference = language === 'my' ? doa.referenceMy : doa.referenceEn

  const copyToClipboard = () => {
    const text = `${name}\n${doa.content}\n${meaning}`
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <Link to="/doa/$slug" params={{ slug: doa.slug }}>
              <CardTitle className="text-lg hover:text-primary transition-colors">
                {name}
              </CardTitle>
            </Link>
            <CardDescription>{reference}</CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Arabic text */}
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-xl leading-relaxed text-foreground mb-3 text-right"
        >
          {doa.content}
        </p>

        {/* Translation */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {meaning}
        </p>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {doa.categoryNames.slice(0, 3).map((category, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
