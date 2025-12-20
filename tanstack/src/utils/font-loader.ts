/**
 * Font utilities for preloading and managing fonts
 */

let isSimpoFontLoaded = false
let fontLoadPromise: Promise<void> | null = null

/**
 * Preload the Simpo Arabic font asynchronously
 */
export async function preloadSimpoFont(): Promise<void> {
  // If font is already loaded, return immediately
  if (isSimpoFontLoaded) {
    return
  }

  // If font is currently loading, return the existing promise
  if (fontLoadPromise) {
    return fontLoadPromise
  }

  // Start loading the font
  fontLoadPromise = loadSimpoFont()
  return fontLoadPromise
}

/**
 * Load the Simpo Arabic font
 */
async function loadSimpoFont(): Promise<void> {
  try {
    const fontResponse = await fetch('/fonts/simpo.ttf')
    if (fontResponse.ok) {
      const fontBuffer = await fontResponse.arrayBuffer()
      const fontFace = new FontFace('Simpo', fontBuffer)
      await fontFace.load()
      document.fonts.add(fontFace)
      isSimpoFontLoaded = true
      console.log('Simpo font loaded successfully')
    } else {
      console.warn('Simpo font not found, using default Arabic font')
    }
  } catch (error) {
    console.warn('Could not load Simpo font, using default Arabic font:', error)
  } finally {
    fontLoadPromise = null
  }
}

/**
 * Check if Simpo font is loaded
 */
export function isSimpoFontReady(): boolean {
  return isSimpoFontLoaded
}

/**
 * Preload essential fonts for the application
 */
export async function preloadEssentialFonts(): Promise<void> {
  // Load Simpo Arabic font in parallel with other optimizations
  const fontPromise = preloadSimpoFont()

  // Add other essential fonts here if needed
  await Promise.allSettled([fontPromise])
}