import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Download, Loader2, ImageOff } from 'lucide-react'
import { DoaSelector } from './doa-selector'
import { BackgroundPicker } from './background-picker'
import { PreviewPanel } from './preview-panel'
import { LimitIndicator } from './limit-indicator'
import { StepHeader } from './step-header'
import { SuccessModal } from './success-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useLanguage } from '@/contexts/language-context'
import { generateDoaImage } from '@/routes/dashboard/functions/image-generator'
import type { DoaItem, Language } from '@/types/doa.types'
import type { ImageLimitInfo } from '@/lib/image-limit'
import { cn } from '@/lib/utils'

interface DoaImageGeneratorProps {
  initialLimitInfo: ImageLimitInfo
  prayers: DoaItem[]
  categories: string[]
}

export function DoaImageGenerator({
  initialLimitInfo,
  prayers,
  categories,
}: DoaImageGeneratorProps) {
  const { language: contextLanguage } = useLanguage()
  const router = useRouter()

  // State
  const [limitInfo, setLimitInfo] = useState<ImageLimitInfo>(initialLimitInfo)
  const [selectedDoa, setSelectedDoa] = useState<DoaItem | null>(null)
  const [selectedBackground, setSelectedBackground] = useState(1)
  const [language, setLanguage] = useState<Language>(
    contextLanguage as Language,
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  )
  const [generatedFilename, setGeneratedFilename] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Mobile collapsible state
  const [doaSectionOpen, setDoaSectionOpen] = useState(true)
  const [bgSectionOpen, setBgSectionOpen] = useState(true)

  // Ref to track current blob URL for cleanup
  const blobUrlRef = useRef<string | null>(null)

  // Cleanup blob URL on unmount or when new URL is created
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    }
  }, [])

  // Step completion status
  const steps = useMemo(
    () => ({
      doaSelected: selectedDoa !== null,
      backgroundSelected: true, // Always has default
      canGenerate: selectedDoa !== null && limitInfo.canGenerate,
    }),
    [selectedDoa, limitInfo.canGenerate],
  )

  // Handlers
  const handleDoaSelect = useCallback((doa: DoaItem) => {
    setSelectedDoa(doa)
    // Cleanup old blob URL when selection changes
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setGeneratedImageUrl(null)
    setError(null)
  }, [])

  const handleBackgroundSelect = useCallback((id: number) => {
    setSelectedBackground(id)
    // Cleanup old blob URL when background changes
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setGeneratedImageUrl(null)
  }, [])

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang)
    // Cleanup old blob URL when language changes
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setGeneratedImageUrl(null)
  }, [])

  const handleDownload = useCallback(() => {
    if (!generatedImageUrl) return

    const link = document.createElement('a')
    link.href = generatedImageUrl
    link.download = generatedFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedImageUrl, generatedFilename])

  // Handle reset time reached - invalidate route to get fresh limit info
  const handleResetTimeReached = useCallback(() => {
    router.invalidate()
  }, [router])

  const handleGenerate = useCallback(async () => {
    if (!selectedDoa) {
      setError('Please select a doa first')
      return
    }

    if (!limitInfo.canGenerate) {
      setError('Daily limit reached. Please try again tomorrow.')
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

      // Handle structured error response
      if (!result.success) {
        setError(result.error.message)
        if (result.error.limitInfo) {
          setLimitInfo(result.error.limitInfo)
        }
        return
      }

      // Cleanup old blob URL before creating new one
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }

      // Create blob URL for preview
      const byteCharacters = atob(result.imageBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: result.mimeType })
      const url = URL.createObjectURL(blob)

      // Track for cleanup
      blobUrlRef.current = url

      setGeneratedImageUrl(url)
      setGeneratedFilename(result.filename)
      setLimitInfo(result.limitInfo)
      setShowSuccessModal(true)

      // Auto-download
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to generate image:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate image. Please try again.',
      )
    } finally {
      setIsGenerating(false)
    }
  }, [selectedDoa, selectedBackground, language, limitInfo.canGenerate])

  // Blocked state (limit reached)
  if (!limitInfo.canGenerate && !generatedImageUrl) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">
            Doa Image Generator
          </h1>
          <p className="text-muted-foreground">
            Create beautiful shareable images of your favorite duas
          </p>
        </div>

        {/* Limit Reached Card */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <ImageOff className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Daily Limit Reached</h2>
              <p className="text-muted-foreground mt-1">
                You've used your free image generation for today.
              </p>
            </div>
            <LimitIndicator
              limitInfo={limitInfo}
              onResetTimeReached={handleResetTimeReached}
            />
            <p className="text-sm text-muted-foreground">
              Come back tomorrow to create another beautiful doa image!
            </p>
          </CardContent>
        </Card>

        {/* Show last generated image if available */}
        {limitInfo.lastGeneratedAt && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                You've created {limitInfo.totalGenerations} image
                {limitInfo.totalGenerations === 1 ? '' : 's'} total.
                Last generated:{' '}
                {new Date(limitInfo.lastGeneratedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">
            Doa Image Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Create beautiful shareable images of your favorite duas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div
            className="relative flex items-center rounded-full bg-secondary/80 p-0.5 shadow-sm"
            role="radiogroup"
            aria-label="Language selection"
          >
            {/* Sliding indicator */}
            <div
              className={cn(
                'absolute h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-primary shadow-sm transition-transform duration-200 ease-out',
                language === 'my' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
              )}
              aria-hidden="true"
            />
            <button
              type="button"
              role="radio"
              aria-checked={language === 'en'}
              onClick={() => handleLanguageChange('en')}
              className={cn(
                'relative z-10 flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                language === 'en'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              EN
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={language === 'my'}
              onClick={() => handleLanguageChange('my')}
              className={cn(
                'relative z-10 flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                language === 'my'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              MY
            </button>
          </div>

          {/* Limit Badge (compact on tablet) */}
          <LimitIndicator
            limitInfo={limitInfo}
            variant="compact"
            className="hidden sm:flex lg:hidden"
            onResetTimeReached={handleResetTimeReached}
          />
        </div>
      </div>

      {/* Limit Indicator (mobile - full) */}
      <div className="sm:hidden">
        <LimitIndicator
          limitInfo={limitInfo}
          onResetTimeReached={handleResetTimeReached}
        />
      </div>

      {/* Limit Indicator (large screens - full) */}
      <div className="hidden lg:block">
        <LimitIndicator
          limitInfo={limitInfo}
          onResetTimeReached={handleResetTimeReached}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Doa Selector */}
        <div className="lg:col-span-2">
          {/* Desktop: Always visible */}
          <Card className="hidden lg:flex lg:flex-col h-[870px]">
            <div className="p-4 border-b">
              <StepHeader
                step={1}
                title="Select a Doa"
                subtitle="Choose the prayer for your image"
                isComplete={steps.doaSelected}
                isActive={!steps.doaSelected}
              />
            </div>
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

          {/* Mobile: Collapsible */}
          <Collapsible
            open={doaSectionOpen}
            onOpenChange={setDoaSectionOpen}
            className="lg:hidden"
          >
            <Card>
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <StepHeader
                  step={1}
                  title="Select a Doa"
                  subtitle={
                    selectedDoa
                      ? language === 'my'
                        ? selectedDoa.nameMy
                        : selectedDoa.nameEn
                      : 'Choose the prayer for your image'
                  }
                  isComplete={steps.doaSelected}
                  isActive={!steps.doaSelected}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-0 border-t">
                  <div className="h-[400px]">
                    <DoaSelector
                      prayers={prayers}
                      categories={categories}
                      selectedDoa={selectedDoa}
                      onSelect={(doa) => {
                        handleDoaSelect(doa)
                        setDoaSectionOpen(false)
                        setBgSectionOpen(true)
                      }}
                      language={language}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Column: Background + Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Background Picker */}
          {/* Desktop: Always visible */}
          <Card className="hidden lg:block">
            <div className="p-4 border-b">
              <StepHeader
                step={2}
                title="Choose Background"
                subtitle="Select a beautiful background"
                isComplete={true}
                isActive={steps.doaSelected && !generatedImageUrl}
              />
            </div>
            <CardContent className="pt-4">
              <BackgroundPicker
                selectedId={selectedBackground}
                onSelect={handleBackgroundSelect}
              />
            </CardContent>
          </Card>

          {/* Mobile: Collapsible */}
          <Collapsible
            open={bgSectionOpen}
            onOpenChange={setBgSectionOpen}
            className="lg:hidden"
          >
            <Card>
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <StepHeader
                  step={2}
                  title="Choose Background"
                  subtitle={`Background ${selectedBackground} selected`}
                  isComplete={true}
                  isActive={steps.doaSelected}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="border-t pt-4">
                  <BackgroundPicker
                    selectedId={selectedBackground}
                    onSelect={handleBackgroundSelect}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Preview + Generate */}
          <Card>
            <div className="p-4 border-b">
              <StepHeader
                step={3}
                title="Preview & Generate"
                subtitle="Review your image and download"
                isComplete={generatedImageUrl !== null}
                isActive={steps.doaSelected}
              />
            </div>
            <CardContent className="pt-4 space-y-4">
              <PreviewPanel
                doa={selectedDoa}
                backgroundId={selectedBackground}
                language={language}
                isLoading={isGenerating}
                generatedImageUrl={generatedImageUrl}
              />

              {/* Generate Button */}
              <Button
                size="lg"
                className={cn(
                  'w-full',
                  steps.canGenerate &&
                    !isGenerating &&
                    'bg-primary hover:bg-primary/90',
                )}
                onClick={handleGenerate}
                disabled={!steps.canGenerate || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : !limitInfo.canGenerate ? (
                  'Daily Limit Reached'
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Generate & Download
                  </>
                )}
              </Button>

              {/* Selected Doa Summary */}
              {selectedDoa && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="font-medium">
                    {language === 'my' ? selectedDoa.nameMy : selectedDoa.nameEn}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {language === 'my'
                      ? selectedDoa.referenceMy
                      : selectedDoa.referenceEn}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        imageUrl={generatedImageUrl}
        filename={generatedFilename}
        onDownload={handleDownload}
      />
    </div>
  )
}
