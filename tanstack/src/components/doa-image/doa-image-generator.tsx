import { useState, useCallback } from 'react'
import { Download, Loader2, Languages } from 'lucide-react'
import { DoaSelector } from './doa-selector'
import { BackgroundPicker } from './background-picker'
import { PreviewPanel } from './preview-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDoaData } from '@/hooks/use-doa-data'
import { useLanguage } from '@/contexts/language-context'
import { generateDoaImage } from '@/routes/dashboard/functions/image-generator'
import type { DoaItem, Language } from '@/types/doa.types'

export function DoaImageGenerator() {
  const { prayers, categories } = useDoaData()
  const { language: contextLanguage } = useLanguage()

  // State
  const [selectedDoa, setSelectedDoa] = useState<DoaItem | null>(null)
  const [selectedBackground, setSelectedBackground] = useState(1)
  const [language, setLanguage] = useState<Language>(contextLanguage as Language)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle doa selection
  const handleDoaSelect = useCallback((doa: DoaItem) => {
    setSelectedDoa(doa)
    setGeneratedImageUrl(null) // Clear previous image
    setError(null)
  }, [])

  // Handle background selection
  const handleBackgroundSelect = useCallback((id: number) => {
    setSelectedBackground(id)
    setGeneratedImageUrl(null) // Clear previous image
  }, [])

  // Handle language change
  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang)
    setGeneratedImageUrl(null) // Clear previous image
  }, [])

  // Generate and download image
  const handleGenerate = useCallback(async () => {
    if (!selectedDoa) {
      setError('Please select a doa first')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateDoaImage({
        data: {
          doaSlug: selectedDoa.slug,
          backgroundId: selectedBackground,
          language,
        },
      })

      // Create blob URL for preview
      const byteCharacters = atob(result.imageBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: result.mimeType })
      const url = URL.createObjectURL(blob)

      setGeneratedImageUrl(url)

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to generate image:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to generate image. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }, [selectedDoa, selectedBackground, language])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doa Image Generator</h1>
          <p className="text-muted-foreground">
            Create beautiful shareable images of your favorite duas
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="my">Bahasa Melayu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Doa Selector */}
        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 p-0 overflow-hidden">
            <DoaSelector
              prayers={prayers}
              categories={categories}
              selectedDoa={selectedDoa}
              onSelect={handleDoaSelect}
              language={language}
            />
          </CardContent>
        </Card>

        {/* Right Column: Background + Preview + Actions */}
        <div className="space-y-6">
          {/* Background Picker */}
          <Card>
            <CardContent className="pt-6">
              <BackgroundPicker
                selectedId={selectedBackground}
                onSelect={handleBackgroundSelect}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardContent className="pt-6">
              <PreviewPanel
                doa={selectedDoa}
                backgroundId={selectedBackground}
                language={language}
                isLoading={isGenerating}
                generatedImageUrl={generatedImageUrl}
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={!selectedDoa || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Generate & Download Image
              </>
            )}
          </Button>

          {/* Selected Doa Info */}
          {selectedDoa && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Selected Doa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-medium">
                  {language === 'my' ? selectedDoa.name_my : selectedDoa.name_en}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'my'
                    ? selectedDoa.reference_my
                    : selectedDoa.reference_en}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
