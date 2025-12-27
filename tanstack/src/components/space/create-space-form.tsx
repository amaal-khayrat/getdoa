import * as React from 'react'
import { useState, useTransition } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TemplateCard } from './template-card'
import { SPACE_TEMPLATES, getTemplateById } from '@/lib/space-templates'
import { useSpaceStore } from '@/stores/space-store'
import { Loader2 } from 'lucide-react'
import { createSpace } from '@/routes/dashboard/functions'

interface CreateSpaceFormProps {
  userId: string
  language?: 'en' | 'my'
  onSuccess?: () => void
}

export function CreateSpaceForm({
  userId,
  language = 'en',
  onSuccess,
}: CreateSpaceFormProps) {
  const navigate = useNavigate()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('morning-azkar')
  const [spaceName, setSpaceName] = useState('')
  const [isPending, startTransition] = useTransition()
  const addSpace = useSpaceStore((state) => state.addSpace)

  const selectedTemplate = getTemplateById(selectedTemplateId)

  // Update space name when template changes
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = getTemplateById(templateId)
    if (template && !spaceName) {
      setSpaceName(language === 'my' ? template.nameMs : template.name)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!spaceName.trim()) return

    startTransition(async () => {
      try {
        const newSpace = await createSpace({
          data: {
            userId,
            input: {
              name: spaceName.trim(),
              icon: selectedTemplate?.icon || 'BookOpen',
              doaSlugs: selectedTemplate?.doaSlugs || [],
            },
          },
        })

        // Add to store
        addSpace(newSpace)

        // Call success callback or navigate
        if (onSuccess) {
          onSuccess()
        } else {
          navigate({ to: '/dashboard' })
        }
      } catch (error) {
        console.error('Failed to create space:', error)
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
          {SPACE_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => handleTemplateSelect(template.id)}
              language={language}
            />
          ))}
        </div>
      </div>

      {/* Space Name */}
      <div className="space-y-2">
        <Label htmlFor="space-name">
          {language === 'my' ? 'Nama Ruang' : 'Space Name'}
        </Label>
        <Input
          id="space-name"
          placeholder={
            language === 'my'
              ? 'Contoh: Zikir Harian Saya'
              : 'e.g., My Daily Prayers'
          }
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
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
      <Button type="submit" disabled={isPending || !spaceName.trim()} size="lg">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {language === 'my' ? 'Cipta Ruang' : 'Create Space'}
      </Button>
    </form>
  )
}
