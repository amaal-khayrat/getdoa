import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, BookOpen, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useCurrentSpaceDoa } from '@/hooks/use-current-space-doa'
import { useCurrentSpace, useSpaceStore } from '@/stores/space-store'
import { useSession } from '@/lib/auth-client'
import { useLanguage } from '@/contexts/language-context'
import { removeDoaFromSpace } from './dashboard/functions'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  const { space, doa, isEmpty } = useCurrentSpaceDoa()
  const currentSpace = useCurrentSpace()
  const removeDoaFromCurrentSpace = useSpaceStore((state) => state.removeDoaFromCurrentSpace)
  const { data: session } = useSession()
  const { language } = useLanguage()

  const handleRemoveDoa = async (slug: string) => {
    if (!currentSpace || !session?.user?.id) return

    try {
      await removeDoaFromSpace({
        data: {
          spaceId: currentSpace.id,
          userId: session.user.id,
          doaSlug: slug,
        },
      })
      removeDoaFromCurrentSpace(slug)
    } catch (error) {
      console.error('Failed to remove doa:', error)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          {space?.name || 'Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEmpty
            ? 'Your space is empty. Add some duas to get started.'
            : `${doa.length} duas in your collection`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link
          to="/doa"
          className={cn(buttonVariants(), 'gap-2')}
        >
          <Plus className="h-4 w-4" />
          Add Duas
        </Link>
        <Link
          to="/dashboard/create-doa-list"
          className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
        >
          <BookOpen className="h-4 w-4" />
          Create List
        </Link>
      </div>

      {/* Doa List */}
      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No duas yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Start building your prayer collection by browsing our library of authentic duas.
            </p>
            <Link to="/doa" className={buttonVariants()}>
              Browse Duas
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {doa.map((item) => (
            <Card key={item.slug} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {language === 'my' ? item.name_my : item.name_en}
                    </CardTitle>
                    <CardDescription>
                      {language === 'my' ? item.reference_my : item.reference_en}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveDoa(item.slug)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-arabic text-right leading-loose mb-3" dir="rtl">
                  {item.content}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'my' ? item.meaning_my : item.meaning_en}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
