import { useDoaListActions, useDoaListState } from './doa-list-builder'
import {
  ListExportPreviewModal,
  type AttributionSettings,
  type ExportSettings,
} from '@/components/list/list-export-preview-modal'
import type { TranslationLayout } from '@/types/doa.types'

export function PreviewModal({
  onClose,
  onExport,
  isGenerating,
}: {
  onClose: () => void
  onExport: () => void
  isGenerating: boolean
}) {
  const { selectedPrayers, listName, language, user, previewSettings } =
    useDoaListState()
  const { updateState } = useDoaListActions()

  // Map internal preview settings to shared component's ExportSettings
  const exportSettings: ExportSettings = {
    showTranslations: previewSettings.showTranslations,
    translationLayout: previewSettings.translationLayout,
  }

  // Map internal attribution to shared component's AttributionSettings
  const attribution: AttributionSettings = {
    showUsername: previewSettings.attribution.showUsername,
    showBranding: previewSettings.attribution.showBranding,
    username: user.username,
  }

  const handleSettingsChange = (settings: ExportSettings) => {
    updateState({
      previewSettings: {
        ...previewSettings,
        showTranslations: settings.showTranslations,
        translationLayout: settings.translationLayout as TranslationLayout,
      },
    })
  }

  const handleAttributionChange = (newAttribution: AttributionSettings) => {
    updateState({
      previewSettings: {
        ...previewSettings,
        attribution: {
          ...previewSettings.attribution,
          showUsername: newAttribution.showUsername,
          showBranding: newAttribution.showBranding,
        },
      },
    })
  }

  return (
    <ListExportPreviewModal
      open={true}
      onOpenChange={(open) => !open && onClose()}
      listName={listName}
      prayers={selectedPrayers}
      language={language}
      settings={exportSettings}
      onSettingsChange={handleSettingsChange}
      onExport={onExport}
      isExporting={isGenerating}
      attribution={attribution}
      onAttributionChange={handleAttributionChange}
    />
  )
}
