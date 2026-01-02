import React, { useMemo } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { TranslationLayout } from '@/types/doa.types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Generic prayer type - works with both DoaItem and Doa
interface Prayer {
  slug: string
  content: string
  nameEn: string
  nameMy: string
  meaningEn: string | null
  meaningMy: string | null
}

export interface ExportSettings {
  showTranslations: boolean
  translationLayout: TranslationLayout
}

export interface AttributionSettings {
  showUsername: boolean
  showBranding: boolean
  username?: string
}

interface ListExportPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // List data
  listName: string
  prayers: Prayer[]
  language: 'en' | 'my'
  // Export settings
  settings: ExportSettings
  onSettingsChange: (settings: ExportSettings) => void
  // Export action
  onExport: () => void
  isExporting: boolean
  // Optional attribution (for doa-list-builder, not needed for public list view)
  attribution?: AttributionSettings
  onAttributionChange?: (settings: AttributionSettings) => void
}

// Memoized ContentInfo component to prevent re-calculations
const ContentInfo = React.memo(
  ({
    prayers,
    showTranslations,
  }: {
    prayers: Prayer[]
    showTranslations: boolean
  }) => {
    // Memoize expensive calculations to prevent re-computation on every render
    const contentMetrics = useMemo(() => {
      const totalCharacters = prayers.reduce((sum, prayer) => {
        return (
          sum +
          (prayer.content?.length || 0) +
          (showTranslations
            ? (prayer.meaningEn?.length || 0) + (prayer.meaningMy?.length || 0)
            : 0)
        )
      }, 0)

      const estimatedLines = Math.ceil(totalCharacters / 50) // Rough estimate

      return {
        prayerCount: prayers.length,
        totalCharacters,
        estimatedLines,
        hasTranslations: showTranslations,
      }
    }, [prayers, showTranslations])

    return (
      <div className="bg-muted/50 p-3 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Content Summary</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            • {contentMetrics.prayerCount} prayer
            {contentMetrics.prayerCount !== 1 ? 's' : ''}
          </div>
          <div>
            • {contentMetrics.hasTranslations ? 'With' : 'Without'} translations
          </div>
          <div>• Approximately {contentMetrics.estimatedLines} lines of text</div>
          <div>• Optimized for readability</div>
          <div>• Dynamic sizing based on content</div>
        </div>
      </div>
    )
  },
)
ContentInfo.displayName = 'ContentInfo'

// Memoized prayer item to prevent unnecessary re-renders
const PrayerPreviewItem = React.memo(
  ({
    prayer,
    index,
    language,
    translationLayout,
    showTranslations,
  }: {
    prayer: Prayer
    index: number
    language: 'en' | 'my'
    translationLayout: TranslationLayout
    showTranslations: boolean
  }) => {
    const name = language === 'my' ? prayer.nameMy : prayer.nameEn
    const meaning = language === 'my' ? prayer.meaningMy : prayer.meaningEn

    if (translationLayout === 'grouped') {
      return (
        <div className="border-l-4 border-primary pl-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {index + 1}. {name}
          </div>
          <p className="font-arabic text-lg text-right" dir="rtl">
            {prayer.content}
          </p>
        </div>
      )
    }

    return (
      <div className="border-l-4 border-primary pl-4">
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {index + 1}. {name}
        </div>
        <p className="font-arabic text-lg text-right" dir="rtl">
          {prayer.content}
        </p>
        {showTranslations && (
          <p className="text-sm text-muted-foreground mt-2 italic">{meaning}</p>
        )}
      </div>
    )
  },
)
PrayerPreviewItem.displayName = 'PrayerPreviewItem'

const layoutOptions = [
  {
    value: 'grouped' as const,
    label: 'Grouped',
    description: 'All Arabic prayers, then all translations',
  },
  {
    value: 'interleaved' as const,
    label: 'Interleaved',
    description: 'Arabic-translation pairs',
  },
]

export function ListExportPreviewModal({
  open,
  onOpenChange,
  listName,
  prayers,
  language,
  settings,
  onSettingsChange,
  onExport,
  isExporting,
  attribution,
  onAttributionChange,
}: ListExportPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none! sm:max-w-none! w-[95vw] h-[85vh] sm:w-[90vw] sm:h-[80vh] md:w-[85vw] md:h-[75vh] lg:w-[80vw] lg:h-[70vh] xl:w-[75vw] xl:h-[65vh] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0"
        showCloseButton={true}
      >
        <DialogHeader className="p-3 sm:p-4 border-b shrink-0">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Preview Your Prayer List
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview and customize your prayer list before exporting as an image
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Preview Panel - Left on Desktop, Top on Mobile */}
          <div className="flex-1 p-3 lg:p-4 overflow-y-auto min-w-0 order-2 lg:order-1">
            <Card
              className="p-4 lg:p-6 shadow-green"
              style={{ minHeight: '200px' }}
            >
              {/* Preview Header */}
              <div className="text-center mb-4 sm:mb-6">
                <h3
                  className="font-arabic text-xl sm:text-2xl mb-3 sm:mb-4 text-primary"
                  dir="rtl"
                >
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </h3>
                {listName && (
                  <h4 className="text-base sm:text-lg font-semibold text-foreground">
                    {listName}
                  </h4>
                )}
              </div>

              {/* Preview Content */}
              <div className="space-y-4">
                {prayers.map((prayer, index) => (
                  <PrayerPreviewItem
                    key={prayer.slug}
                    prayer={prayer}
                    index={index}
                    language={language}
                    translationLayout={settings.translationLayout}
                    showTranslations={settings.showTranslations}
                  />
                ))}

                {/* Grouped Translations */}
                {settings.translationLayout === 'grouped' &&
                  settings.showTranslations && (
                    <div className="mt-8 pt-8 border-t">
                      <h5 className="text-sm font-semibold text-foreground mb-4">
                        Translations
                      </h5>
                      {prayers.map((prayer, index) => (
                        <div key={`translation-${prayer.slug}`} className="mb-4">
                          <p className="text-sm text-muted-foreground">
                            {index + 1}.{' '}
                            {language === 'my'
                              ? prayer.meaningMy
                              : prayer.meaningEn}
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
                  {attribution?.username && attribution.showUsername && (
                    <div>List Created By: {attribution.username}</div>
                  )}
                  {attribution?.showBranding && (
                    <div>List Created on GetDoa.com, go create yours now</div>
                  )}
                  {/* When no attribution props, show simple branding */}
                  {!attribution && <div>GetDoa.com</div>}
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Panel - Right on Desktop, Bottom on Mobile */}
          <div className="w-full lg:w-80 xl:w-96 p-3 lg:p-4 overflow-y-auto shrink-0 order-1 lg:order-2 border-t lg:border-t-0 lg:border-l">
            <div className="space-y-4 lg:space-y-6">
              {/* Content Info */}
              <ContentInfo
                prayers={prayers}
                showTranslations={settings.showTranslations}
              />

              {/* Translation Settings */}
              <div>
                <h3 className="text-sm font-medium mb-3">Translation Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.showTranslations}
                      onCheckedChange={(checked) =>
                        onSettingsChange({
                          ...settings,
                          showTranslations: checked,
                        })
                      }
                    />
                    <Label className="text-sm">Show translations</Label>
                  </div>

                  {settings.showTranslations && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-3 block">
                        Layout
                      </Label>
                      <RadioGroup
                        value={settings.translationLayout}
                        onValueChange={(value) => {
                          if (value === 'grouped' || value === 'interleaved') {
                            onSettingsChange({
                              ...settings,
                              translationLayout: value as TranslationLayout,
                            })
                          }
                        }}
                      >
                        {layoutOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-start space-x-3"
                          >
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
                  )}
                </div>
              </div>

              {/* Attribution Settings - Only shown when attribution props are provided */}
              {attribution && onAttributionChange && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Attribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={attribution.showUsername}
                        onCheckedChange={(checked) =>
                          onAttributionChange({
                            ...attribution,
                            showUsername: checked,
                          })
                        }
                        disabled={!attribution.username}
                      />
                      <Label className="text-sm">
                        Show username{' '}
                        {attribution.username
                          ? `(${attribution.username})`
                          : '(not logged in)'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={attribution.showBranding}
                        onCheckedChange={(checked) =>
                          onAttributionChange({
                            ...attribution,
                            showBranding: checked,
                          })
                        }
                      />
                      <Label className="text-sm">Show GetDoa branding</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  onClick={onExport}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export as PNG
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
