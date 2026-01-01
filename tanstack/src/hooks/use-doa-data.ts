import { useEffect, useState } from 'react'
import { getAllDoas, getDoaCategories } from '@/routes/dashboard/functions/doa'
import type { Doa } from '@/types/doa.types'

export function useDoaData() {
  const [prayers, setPrayers] = useState<Doa[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch prayers and categories in parallel
        const [doasResult, categoriesResult] = await Promise.all([
          getAllDoas({ data: { limit: 100 } }),
          getDoaCategories(),
        ])

        setPrayers(doasResult.data)
        setCategories(categoriesResult)
      } catch (err) {
        console.error('Failed to fetch doa data:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch data'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    prayers,
    categories,
    totalPrayers: prayers.length,
    isLoading,
    error,
  }
}
