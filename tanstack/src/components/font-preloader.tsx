import { useEffect } from 'react'
import { preloadEssentialFonts } from '@/utils/font-loader'

/**
 * Component that preloads essential fonts when the app starts
 */
export function FontPreloader() {
  useEffect(() => {
    // Start preloading fonts in the background
    preloadEssentialFonts().catch((error) => {
      console.warn('Font preloading failed:', error)
    })
  }, [])

  // This component doesn't render anything
  return null
}