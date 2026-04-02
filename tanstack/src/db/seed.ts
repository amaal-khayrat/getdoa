import { readFileSync } from 'fs'
import { resolve } from 'path'
import { db } from './index'
import { doa, doaHadithMatch } from './schema'
import { eq, inArray, sql } from 'drizzle-orm'
import {
  computeDoaHash,
  toDoaHadithMatchRecords,
  toDoaRecord,
  type DoaJsonEntry,
  type DoaJsonHadithMatchEntry,
} from './seed-utils'

// Advisory lock ID for preventing concurrent seed runs
const SEED_LOCK_ID = 12345

interface DoaHadithJoinedJsonEntry {
  slug: string
  hadith_matched: boolean
  matched_reference: string | null
  hadith_book: string | null
  hadith_chapter_number: number | null
  hadith_chapter_title_arabic: string | null
  hadith_chapter_title_english: string | null
  hadith_arabic_text: string | null
  hadith_english_text: string | null
  hadith_grade: string | null
  hadith_reference_url: string | null
  hadith_inbook_reference: string | null
}

function readJsonFile<T>(relativePath: string, label: string): T {
  const jsonPath = resolve(process.cwd(), relativePath)

  try {
    return JSON.parse(readFileSync(jsonPath, 'utf-8')) as T
  } catch (err) {
    throw new Error(
      `Failed to read/parse ${label}: ${err instanceof Error ? err.message : err}`,
    )
  }
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function buildHadithMatchesBySlug(
  baseEntries: DoaJsonEntry[],
  joinedEntries: DoaHadithJoinedJsonEntry[],
): Map<string, DoaJsonHadithMatchEntry[]> {
  const baseSlugs = new Set(baseEntries.map((entry) => entry.slug))
  const joinedSlugs = new Set(joinedEntries.map((entry) => entry.slug))

  const missingInBase = [...joinedSlugs].filter((slug) => !baseSlugs.has(slug))
  if (missingInBase.length > 0) {
    throw new Error(
      `Found ${missingInBase.length} slugs in doa_hadith_joined.json that are missing from doa.json: ${missingInBase.slice(0, 10).join(', ')}${missingInBase.length > 10 ? '...' : ''}`,
    )
  }

  const missingInJoined = [...baseSlugs].filter((slug) => !joinedSlugs.has(slug))
  if (missingInJoined.length > 0) {
    throw new Error(
      `Found ${missingInJoined.length} slugs in doa.json that are missing from doa_hadith_joined.json: ${missingInJoined.slice(0, 10).join(', ')}${missingInJoined.length > 10 ? '...' : ''}`,
    )
  }

  const matchesBySlug = new Map<string, DoaJsonHadithMatchEntry[]>()
  const seenKeysBySlug = new Map<string, Set<string>>()

  for (const entry of joinedEntries) {
    if (!entry.hadith_matched) {
      continue
    }

    const match: DoaJsonHadithMatchEntry = {
      matched_reference: normalizeNullableText(entry.matched_reference),
      hadith_book: normalizeNullableText(entry.hadith_book),
      hadith_chapter_number:
        typeof entry.hadith_chapter_number === 'number' &&
        Number.isFinite(entry.hadith_chapter_number)
          ? entry.hadith_chapter_number
          : null,
      hadith_chapter_title_arabic: normalizeNullableText(
        entry.hadith_chapter_title_arabic,
      ),
      hadith_chapter_title_english: normalizeNullableText(
        entry.hadith_chapter_title_english,
      ),
      hadith_arabic_text: normalizeNullableText(entry.hadith_arabic_text),
      hadith_english_text: normalizeNullableText(entry.hadith_english_text),
      hadith_grade: normalizeNullableText(entry.hadith_grade),
      hadith_reference_url: normalizeNullableText(entry.hadith_reference_url),
      hadith_inbook_reference: normalizeNullableText(
        entry.hadith_inbook_reference,
      ),
    }

    if (
      !match.matched_reference &&
      !match.hadith_reference_url &&
      !match.hadith_arabic_text &&
      !match.hadith_english_text
    ) {
      continue
    }

    const dedupeKey = JSON.stringify(match)
    const seenKeys = seenKeysBySlug.get(entry.slug) ?? new Set<string>()

    if (seenKeys.has(dedupeKey)) {
      continue
    }

    seenKeys.add(dedupeKey)
    seenKeysBySlug.set(entry.slug, seenKeys)

    const existingMatches = matchesBySlug.get(entry.slug) ?? []
    existingMatches.push(match)
    matchesBySlug.set(entry.slug, existingMatches)
  }

  return matchesBySlug
}

export interface SeedResult {
  inserted: number
  updated: number
  skipped: number
  deleted: number
  errors: string[]
  duration: number
}

/**
 * Acquire PostgreSQL advisory lock to prevent concurrent seed runs.
 * Returns true if lock acquired, false if already locked by another process.
 */
async function acquireLock(): Promise<boolean> {
  const result = await db.execute<{ pg_try_advisory_lock: boolean }>(
    sql`SELECT pg_try_advisory_lock(${SEED_LOCK_ID})`,
  )
  const row = result.rows?.[0] as { pg_try_advisory_lock: boolean } | undefined
  return row?.pg_try_advisory_lock ?? false
}

/**
 * Release the advisory lock.
 */
async function releaseLock(): Promise<void> {
  await db.execute(sql`SELECT pg_advisory_unlock(${SEED_LOCK_ID})`)
}

export async function seedDoa(options?: {
  deleteOrphans?: boolean
  dryRun?: boolean
}): Promise<SeedResult> {
  const startTime = Date.now()
  const { deleteOrphans = true, dryRun = false } = options ?? {}

  const result: SeedResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    deleted: 0,
    errors: [],
    duration: 0,
  }

  // Acquire lock to prevent concurrent seed runs
  const lockAcquired = await acquireLock()
  if (!lockAcquired) {
    result.errors.push('Another seed process is already running')
    console.error('Another seed process is already running. Exiting.')
    return result
  }

  try {
    if (dryRun) {
      console.log('DRY RUN MODE - No changes will be made\n')
    }

    // 1. Load and validate JSON data
    const jsonData = readJsonFile<DoaJsonEntry[]>('data/doa.json', 'doa.json')
    const hadithJoinedData = readJsonFile<DoaHadithJoinedJsonEntry[]>(
      'data/doa_hadith_joined.json',
      'doa_hadith_joined.json',
    )

    // Validate required fields
    const invalidEntries = jsonData.filter(
      (e) => !e.slug || !e.name_my || !e.name_en || !e.content,
    )
    if (invalidEntries.length > 0) {
      throw new Error(
        `Found ${invalidEntries.length} entries with missing required fields: ${invalidEntries.map((e) => e.slug || 'unknown').join(', ')}`,
      )
    }

    // Check for duplicate slugs in JSON
    const slugCounts = new Map<string, number>()
    jsonData.forEach((e) =>
      slugCounts.set(e.slug, (slugCounts.get(e.slug) ?? 0) + 1),
    )
    const duplicates = [...slugCounts.entries()].filter(
      ([, count]) => count > 1,
    )
    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate slugs in doa.json: ${duplicates.map(([slug]) => slug).join(', ')}`,
      )
    }

    console.log(`Loaded ${jsonData.length} duas from doa.json`)
    console.log(
      `Loaded ${hadithJoinedData.length} rows from doa_hadith_joined.json`,
    )

    const hadithMatchesBySlug = buildHadithMatchesBySlug(
      jsonData,
      hadithJoinedData,
    )
    const matchedSlugCount = [...hadithMatchesBySlug.values()].filter(
      (matches) => matches.length > 0,
    ).length
    console.log(`Matched hadith found for ${matchedSlugCount} duas`)

    // 2. Merge hadith data and compute hashes
    const mergedDoaEntries = jsonData.map((entry) => ({
      ...entry,
      hadith_matches: hadithMatchesBySlug.get(entry.slug) ?? [],
    }))

    const doaWithHashes = mergedDoaEntries.map((entry) => ({
      ...entry,
      contentHash: computeDoaHash(entry),
    }))

    // 3. Fetch existing records
    const existingRecords = await db
      .select({ slug: doa.slug, contentHash: doa.contentHash })
      .from(doa)

    const existingMap = new Map(
      existingRecords.map((r) => [r.slug, r.contentHash]),
    )
    console.log(`Found ${existingRecords.length} existing duas in database`)

    // 4. Categorize operations
    const toInsert: (typeof doaWithHashes)[number][] = []
    const toUpdate: (typeof doaWithHashes)[number][] = []
    const jsonSlugs = new Set<string>()

    for (const entry of doaWithHashes) {
      jsonSlugs.add(entry.slug)
      const existingHash = existingMap.get(entry.slug)

      if (!existingHash) {
        toInsert.push(entry)
      } else if (existingHash !== entry.contentHash) {
        toUpdate.push(entry)
      } else {
        result.skipped++
      }
    }

    // 5. Detect orphans
    const orphanedSlugs = existingRecords
      .filter((r) => !jsonSlugs.has(r.slug))
      .map((r) => r.slug)

    // Log planned changes
    console.log(`\nPlanned changes:`)
    console.log(`   Insert: ${toInsert.length}`)
    console.log(`   Update: ${toUpdate.length}`)
    console.log(`   Skip:   ${result.skipped}`)
    console.log(
      `   Orphans: ${orphanedSlugs.length}${deleteOrphans ? ' (will delete)' : ' (preserved)'}`,
    )

    if (dryRun) {
      if (toInsert.length > 0) {
        console.log(
          `\n   New slugs: ${toInsert.slice(0, 5).map((e) => e.slug).join(', ')}${toInsert.length > 5 ? '...' : ''}`,
        )
      }
      if (toUpdate.length > 0) {
        console.log(
          `   Changed slugs: ${toUpdate.slice(0, 5).map((e) => e.slug).join(', ')}${toUpdate.length > 5 ? '...' : ''}`,
        )
      }
      console.log('\nDry run completed. No changes made.')
      result.inserted = toInsert.length
      result.updated = toUpdate.length
      result.deleted = deleteOrphans ? orphanedSlugs.length : 0
      result.duration = Date.now() - startTime
      return result
    }

    // 6. Execute changes in a transaction
    await db.transaction(async (tx) => {
      const changedEntries = [...toInsert, ...toUpdate]
      const changedSlugs = changedEntries.map((entry) => entry.slug)

      // Batch insert
      if (toInsert.length > 0) {
        console.log(`\nInserting ${toInsert.length} new duas...`)
        const BATCH_SIZE = 50

        for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
          const batch = toInsert.slice(i, i + BATCH_SIZE)
          await tx.insert(doa).values(batch.map(toDoaRecord))
          console.log(
            `   Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toInsert.length / BATCH_SIZE)} inserted`,
          )
        }
        result.inserted = toInsert.length
      }

      // Update changed records
      if (toUpdate.length > 0) {
        console.log(`\nUpdating ${toUpdate.length} changed duas...`)

        for (const entry of toUpdate) {
          const record = toDoaRecord(entry)
          await tx.update(doa).set(record).where(eq(doa.slug, entry.slug))
        }
        result.updated = toUpdate.length
        console.log(`   Updated ${toUpdate.length} records`)
      }

      // Replace hadith matches for changed duas
      if (changedSlugs.length > 0) {
        console.log(`\nSyncing hadith matches for ${changedSlugs.length} duas...`)

        await tx
          .delete(doaHadithMatch)
          .where(inArray(doaHadithMatch.doaSlug, changedSlugs))

        const hadithMatchRecords = changedEntries.flatMap((entry) =>
          toDoaHadithMatchRecords(entry),
        )

        if (hadithMatchRecords.length > 0) {
          const BATCH_SIZE = 100

          for (let i = 0; i < hadithMatchRecords.length; i += BATCH_SIZE) {
            const batch = hadithMatchRecords.slice(i, i + BATCH_SIZE)
            await tx.insert(doaHadithMatch).values(batch)
          }
        }

        console.log(
          `   Synced ${changedEntries.reduce((count, entry) => count + (entry.hadith_matches?.length ?? 0), 0)} hadith matches`,
        )
      }

      // Delete orphans if requested
      if (deleteOrphans && orphanedSlugs.length > 0) {
        console.log(`\nDeleting ${orphanedSlugs.length} orphaned duas...`)
        await tx.delete(doa).where(inArray(doa.slug, orphanedSlugs))
        result.deleted = orphanedSlugs.length
      }
    })

    // 7. Report orphans if not deleting
    if (!deleteOrphans && orphanedSlugs.length > 0) {
      console.log(`\nFound ${orphanedSlugs.length} orphaned duas (not in JSON):`)
      orphanedSlugs
        .slice(0, 10)
        .forEach((slug) => console.log(`   - ${slug}`))
      if (orphanedSlugs.length > 10) {
        console.log(`   ... and ${orphanedSlugs.length - 10} more`)
      }
      console.log('   Run with --delete-orphans to remove them.')
    }

    // 8. Summary
    result.duration = Date.now() - startTime
    console.log('\nSeed completed!')
    console.log(`   Inserted: ${result.inserted}`)
    console.log(`   Updated:  ${result.updated}`)
    console.log(`   Skipped:  ${result.skipped}`)
    console.log(`   Deleted:  ${result.deleted}`)
    console.log(`   Duration: ${result.duration}ms`)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    result.errors.push(msg)
    console.error('Seed failed:', msg)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
  } finally {
    // Always release the lock
    await releaseLock()
  }

  result.duration = Date.now() - startTime
  return result
}

// CLI entry point
const isMainModule =
  process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')

if (isMainModule) {
  const deleteOrphans = process.argv.includes('--delete-orphans')
  const dryRun = process.argv.includes('--dry-run')

  console.log('Starting doa seed...\n')

  seedDoa({ deleteOrphans, dryRun })
    .then((result) => {
      process.exit(result.errors.length > 0 ? 1 : 0)
    })
    .catch((err) => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}
