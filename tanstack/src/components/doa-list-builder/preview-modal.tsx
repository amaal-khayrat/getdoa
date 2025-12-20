import React from 'react'
import { Download, Eye, X } from 'lucide-react'
import { useDoaListActions, useDoaListState } from './doa-list-builder'
import type { ImageSize, TranslationLayout } from '@/types/doa.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { IMAGE_SIZE_PRESETS } from '@/types/doa.types'

export function PreviewModal({
  onClose,
  onExport,
  isGenerating,
}: {
  onClose: () => void
  onExport: () => void
  isGenerating: boolean
}) {
  const {
    selectedPrayers,
    title,
    description,
    language,
    user,
    previewSettings,
  } = useDoaListState()
  const { updateState } = useDoaListActions()

  const layoutOptions = [
    {
      value: 'grouped',
      label: 'Grouped',
      description: 'All Arabic prayers, then all translations',
    },
    {
      value: 'interleaved',
      label: 'Interleaved',
      description: 'Arabic-translation pairs',
    },
  ] as const

  const sizeOptions: Array<{
    value: ImageSize
    label: string
    dimensions: string
  }> = [
    { value: 'a4', label: 'A4', dimensions: '2480 × 3508px' },
    {
      value: 'instagram-story',
      label: 'Instagram Story',
      dimensions: '1080 × 1920px',
    },
    { value: 'square', label: 'Square', dimensions: '1080 × 1080px' },
    { value: 'custom', label: 'Custom', dimensions: '1080 × 1350px' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Preview Your Prayer List</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Left Panel - Preview */}
          <div className="flex-1 p-4 border-r overflow-y-auto">
            <Card className="p-6 shadow-green" style={{ minHeight: '600px' }}>
              {/* Preview Header */}
              <div className="text-center mb-6">
                <h3 className="font-arabic text-2xl mb-4 text-primary" dir="rtl">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </h3>
                {title && (
                  <h4 className="text-lg font-semibold text-foreground">
                    {title}
                  </h4>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>

              {/* Preview Content */}
              <div className="space-y-4">
                {selectedPrayers.map((prayer, index) => {
                  if (previewSettings.translationLayout === 'grouped') {
                    return (
                      <div
                        key={prayer.slug}
                        className="border-l-4 border-primary pl-4"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          {index + 1}.{' '}
                          {language === 'my' ? prayer.name_my : prayer.name_en}
                        </div>
                        <p className="font-arabic text-lg text-right" dir="rtl">
                          {prayer.content}
                        </p>
                      </div>
                    )
                  } else {
                    // Interleaved
                    return (
                      <div
                        key={prayer.slug}
                        className="border-l-4 border-primary pl-4"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          {index + 1}.{' '}
                          {language === 'my' ? prayer.name_my : prayer.name_en}
                        </div>
                        <p className="font-arabic text-lg text-right" dir="rtl">
                          {prayer.content}
                        </p>
                        {previewSettings.showTranslations && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            {language === 'my'
                              ? prayer.meaning_my
                              : prayer.meaning_en}
                          </p>
                        )}
                      </div>
                    )
                  }
                })}

                {/* Grouped Translations */}
                {previewSettings.translationLayout === 'grouped' &&
                  previewSettings.showTranslations && (
                    <div className="mt-8 pt-8 border-t">
                      <h5 className="text-sm font-semibold text-foreground mb-4">
                        Translations
                      </h5>
                      {selectedPrayers.map((prayer, index) => (
                        <div
                          key={`translation-${prayer.slug}`}
                          className="mb-4"
                        >
                          <p className="text-sm text-muted-foreground">
                            {index + 1}.{' '}
                            {language === 'my'
                              ? prayer.meaning_my
                              : prayer.meaning_en}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-6 border-t">
                <p className="font-arabic text-xl mb-2 text-primary" dir="rtl">
                  أٰمِيْنَ
                </p>
                <div className="text-xs text-muted-foreground">
                  {user.username && <div>List Created By: {user.username}</div>}
                  <div>List Created on GetDoa.com, go create yours now</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Settings */}
          <div className="w-80 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Translation Settings */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Translation Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showTranslations}
                      onCheckedChange={(checked) =>
                        updateState({
                          previewSettings: {
                            ...previewSettings,
                            showTranslations: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="show-translations" className="text-sm">
                      Show translations
                    </Label>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground mb-3 block">
                      Layout
                    </Label>
                    <RadioGroup
                      value={previewSettings.translationLayout}
                      onValueChange={(value) =>
                        updateState({
                          previewSettings: {
                            ...previewSettings,
                            translationLayout: value as TranslationLayout,
                          },
                        })
                      }
                    >
                      {layoutOptions.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3">
                          <RadioGroupItem
                            value={option.value}
                            id={`layout-${option.value}`}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`layout-${option.value}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {option.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Export Settings */}
              <div>
                <h3 className="text-sm font-medium mb-3">Export Settings</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Image Size
                    </Label>
                    <Select
                      value={previewSettings.imageSize}
                      onValueChange={(value) =>
                        updateState({
                          previewSettings: {
                            ...previewSettings,
                            imageSize: value as ImageSize,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.dimensions})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Background Color
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={previewSettings.backgroundColor}
                        onChange={(e) =>
                          updateState({
                            previewSettings: {
                              ...previewSettings,
                              backgroundColor: e.target.value,
                            },
                          })
                        }
                        className="w-8 h-8 rounded border p-1"
                      />
                      <Input
                        type="text"
                        value={previewSettings.backgroundColor}
                        onChange={(e) =>
                          updateState({
                            previewSettings: {
                              ...previewSettings,
                              backgroundColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribution Settings */}
              <div>
                <h3 className="text-sm font-medium mb-3">Attribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.attribution.showUsername}
                      onCheckedChange={(checked) =>
                        updateState({
                          previewSettings: {
                            ...previewSettings,
                            attribution: {
                              ...previewSettings.attribution,
                              showUsername: checked,
                            },
                          },
                        })
                      }
                      disabled={!user.username}
                    />
                    <Label htmlFor="show-username" className="text-sm">
                      Show username{' '}
                      {user.username ? `(${user.username})` : '(not logged in)'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.attribution.showBranding}
                      onCheckedChange={(checked) =>
                        updateState({
                          previewSettings: {
                            ...previewSettings,
                            attribution: {
                              ...previewSettings.attribution,
                              showBranding: checked,
                            },
                          },
                        })
                      }
                    />
                    <Label htmlFor="show-branding" className="text-sm">
                      Show GetDoa branding
                    </Label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={onExport}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export as PNG
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
