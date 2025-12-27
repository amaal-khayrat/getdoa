import { useMemo } from 'react'
import { useCurrentSpace, useSpaceDoaSlugs } from '@/stores/space-store'
import { useDoaData } from '@/hooks/use-doa-data'
import type { DoaItem } from '@/types/doa.types'

export function useCurrentSpaceDoa() {
  const currentSpace = useCurrentSpace()
  const doaSlugs = useSpaceDoaSlugs()
  const { prayers } = useDoaData()

  const spaceDoa = useMemo(() => {
    if (!currentSpace || !doaSlugs.length) return []

    // Map slugs to doa items, preserving order
    return doaSlugs
      .map((slug) => prayers.find((p) => p.slug === slug))
      .filter((p): p is DoaItem => p !== undefined)
  }, [currentSpace, doaSlugs, prayers])

  return {
    space: currentSpace,
    doa: spaceDoa,
    doaCount: spaceDoa.length,
    isEmpty: spaceDoa.length === 0,
  }
}
