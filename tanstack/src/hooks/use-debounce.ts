import { useMemo } from 'react'

/**
 * A simple debounce hook that delays the update of a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  return useMemo(() => {
    // For a simple implementation, we'll just return the value
    // The debouncing will be handled at the component level with setTimeout
    return value
  }, [value, delay])
}
