import { Download, X } from 'lucide-react'
import React, { useMemo } from 'react'
import { useDoaListActions, useDoaListState } from './doa-list-builder'
import type { TranslationLayout } from '@/types/doa.types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Memoized ContentInfo component to prevent re-calculations
const ContentInfo = ({
  prayers,
  showTranslations,
}: {
  prayers: Array<any>
  showTranslations: boolean
}) => {
  // Memoize expensive calculations to prevent re-computation on every render
  const contentMetrics = useMemo(() => {
    const totalCharacters = prayers.reduce((sum, prayer) => {
      return (
        sum +
        (prayer.content?.length || 0) +
        (showTranslations
          ? (prayer.meaning_en?.length || 0) + (prayer.meaning_my?.length || 0)
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
}

// Memoized prayer item to prevent unnecessary re-renders
const PrayerItem = React.memo(
  ({
    prayer,
    index,
    language,
    translationLayout,
    showTranslations,
  }: {
    prayer: any
    index: number
    language: 'en' | 'my'
    translationLayout: 'grouped' | 'interleaved'
    showTranslations: boolean
  }) => {
    if (translationLayout === 'grouped') {
      return (
        <div className="border-l-4 border-primary pl-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {index + 1}. {language === 'my' ? prayer.name_my : prayer.name_en}
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
          {index + 1}. {language === 'my' ? prayer.name_my : prayer.name_en}
        </div>
        <p className="font-arabic text-lg text-right" dir="rtl">
          {prayer.content}
        </p>
        {showTranslations && (
          <p className="text-sm text-muted-foreground mt-2 italic">
            {language === 'my' ? prayer.meaning_my : prayer.meaning_en}
          </p>
        )}
      </div>
    )
  },
)

PrayerItem.displayName = 'PrayerItem'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal - PROPERLY RESPONSIVE sizing */}
      <div className="relative bg-background rounded-lg shadow-xl w-[95vw] h-[85vh] sm:w-[90vw] sm:h-[80vh] md:w-[85vw] md:h-[75vh] lg:w-[80vw] lg:h-[70vh] xl:w-[75vw] xl:h-[65vh] max-w-7xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold">Preview Your Prayer List</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Preview Panel - Left on Desktop, Top on Mobile */}
          <div className="flex-1 p-3 lg:p-4 overflow-y-auto min-w-0 order-2 lg:order-1">
            <Card className="p-4 lg:p-6 shadow-green" style={{ minHeight: '200px' }}>
              {/* Preview Header */}
              <div className="text-center mb-4 sm:mb-6">
                <h3
                  className="font-arabic text-xl sm:text-2xl mb-3 sm:mb-4 text-primary"
                  dir="rtl"
                >
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </h3>
                {title && (
                  <h4 className="text-base sm:text-lg font-semibold text-foreground">
                    {title}
                  </h4>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>

              {/* Preview Content */}
              <div className="space-y-4">
                {selectedPrayers.map((prayer, index) => (
                  <PrayerItem
                    key={prayer.slug}
                    prayer={prayer}
                    index={index}
                    language={language}
                    translationLayout={previewSettings.translationLayout}
                    showTranslations={previewSettings.showTranslations}
                  />
                ))}

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
                  {user.username && previewSettings.attribution.showUsername && (
                    <div>List Created By: {user.username}</div>
                  )}
                  {previewSettings.attribution.showBranding && (
                    <div>List Created on GetDoa.com, go create yours now</div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Panel - Right on Desktop, Bottom on Mobile */}
          <div className="w-full lg:w-80 xl:w-96 p-3 lg:p-4 overflow-y-auto shrink-0 order-1 lg:order-2 border-t lg:border-t-0 lg:border-l">
            <div className="space-y-4 lg:space-y-6">
              {/* Content Info */}
              <ContentInfo
                prayers={selectedPrayers}
                showTranslations={previewSettings.showTranslations}
              />

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
                    <Label className="text-sm">Show translations</Label>
                  </div>

                  {previewSettings.showTranslations && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-3 block">
                        Layout
                      </Label>
                      <RadioGroup
                        value={previewSettings.translationLayout}
                        onValueChange={(value) => {
                          if (value === 'grouped' || value === 'interleaved') {
                            updateState({
                              previewSettings: {
                                ...previewSettings,
                                translationLayout: value as TranslationLayout,
                              },
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
                    <Label className="text-sm">
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
                    <Label className="text-sm">Show GetDoa branding</Label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t">
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
