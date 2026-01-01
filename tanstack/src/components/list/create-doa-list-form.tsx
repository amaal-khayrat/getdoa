import { useState, useTransition } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ListTemplateCard } from './list-template-card'
import { LIST_TEMPLATES, getTemplateById } from '@/lib/list-templates'
import { Loader2 } from 'lucide-react'
import { createDoaList } from '@/routes/dashboard/functions'
import type { PrayerReference } from '@/types/doa-list.types'
import { toast } from 'sonner'

interface CreateDoaListFormProps {
  userId: string
  language?: 'en' | 'my'
  onSuccess?: () => void
}

export function CreateDoaListForm({
  userId,
  language = 'en',
  onSuccess,
}: CreateDoaListFormProps) {
  const navigate = useNavigate()
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>('morning-azkar')
  const [listName, setListName] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedTemplate = getTemplateById(selectedTemplateId)

  // Update list name when template changes
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = getTemplateById(templateId)
    if (template && !listName) {
      setListName(language === 'my' ? template.nameMs : template.name)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!listName.trim()) return

    startTransition(async () => {
      try {
        // Convert template slugs to prayer references with order
        const prayers: PrayerReference[] =
          selectedTemplate?.doaSlugs.map((slug, index) => ({
            slug,
            order: index,
          })) || []

        const result = await createDoaList({
          data: {
            userId,
            input: {
              name: listName.trim(),
              prayers,
              language,
            },
          },
        })

        // Handle result
        if (!result.success) {
          if (result.error.code === 'LIST_LIMIT_REACHED') {
            toast.error(result.error.message, {
              action: {
                label: 'Invite Friends',
                onClick: () => navigate({ to: '/dashboard/referrals' }),
              },
            })
          } else {
            toast.error(result.error.message)
          }
          return
        }

        // Call success callback or navigate
        if (onSuccess) {
          onSuccess()
        } else {
          navigate({ to: '/dashboard' })
        }
      } catch (error) {
        console.error('Failed to create list:', error)
        toast.error('Failed to create list. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Template Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">
            {language === 'my' ? 'Pilih Template' : 'Choose a Template'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'my'
              ? 'Mulakan dengan koleksi doa yang telah disediakan atau mulakan dari kosong'
              : 'Start with a pre-made collection or start from scratch'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIST_TEMPLATES.map((template) => (
            <ListTemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => handleTemplateSelect(template.id)}
              language={language}
            />
          ))}
        </div>
      </div>

      {/* List Name */}
      <div className="space-y-2">
        <Label htmlFor="list-name">
          {language === 'my' ? 'Nama Senarai' : 'List Name'}
        </Label>
        <Input
          id="list-name"
          placeholder={
            language === 'my'
              ? 'Contoh: Zikir Harian Saya'
              : 'e.g., My Daily Prayers'
          }
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="max-w-md"
          required
        />
        <p className="text-sm text-muted-foreground">
          {language === 'my'
            ? 'Anda boleh menukar nama ini kemudian'
            : 'You can change this name later'}
        </p>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isPending || !listName.trim()} size="lg">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {language === 'my' ? 'Cipta Senarai' : 'Create List'}
      </Button>
    </form>
  )
}
