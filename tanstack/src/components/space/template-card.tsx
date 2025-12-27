import * as React from 'react'
import {
  Sunrise,
  Sunset,
  Heart,
  Calendar,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SpaceTemplate } from '@/types/space.types'

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Sunrise,
  Sunset,
  Heart,
  Calendar,
  Plus,
}

interface TemplateCardProps {
  template: SpaceTemplate
  isSelected: boolean
  onSelect: () => void
  language: 'en' | 'my'
}

export function TemplateCard({
  template,
  isSelected,
  onSelect,
  language,
}: TemplateCardProps) {
  const Icon = iconMap[template.icon] || Plus
  const name = language === 'my' ? template.nameMs : template.name
  const description =
    language === 'my' ? template.descriptionMs : template.description

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary border-primary',
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
        {template.doaSlugs.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {template.doaSlugs.length}{' '}
            {language === 'my' ? 'doa disertakan' : 'duas included'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
