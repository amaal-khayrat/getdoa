import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

import * as schema from './schema'

config()

// CRITICAL: node-postgres ignores ssl config if sslmode is in the connection string
// We must remove sslmode from URL and handle SSL via config object
// See: https://github.com/brianc/node-postgres/issues/2281
const rawDatabaseUrl = process.env.DATABASE_URL || ''
const requiresSsl = rawDatabaseUrl.includes('sslmode=require')

// Strip sslmode from URL to avoid conflict with ssl config
const databaseUrl = rawDatabaseUrl.replace(/[?&]sslmode=[^&]*/g, '')

const pool = new Pool({
  connectionString: databaseUrl,
  // For self-signed certificates (like Autobase cluster), disable certificate validation
  // This is safe for internal VPC connections where you trust the endpoint
  ssl: requiresSsl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
})

export const db = drizzle(pool, { schema })

// Function to apply migrations
export async function applyMigrations() {
  try {
    console.log('Applying migrations...')
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('Migrations applied successfully')
  } catch (error: any) {
    // Check if it's a column already exists error
    if (error?.code === '42701') {
      console.log(
        'Migration skipped: Column already exists (likely from drizzle-kit push)',
      )
      // Don't throw - the schema is already up to date
      return
    }
    console.error('Failed to apply migrations:', error)
    throw error // Rethrow for deployment rollback
  }
}

// Seed doa data (runs on every startup, idempotent)
async function seedDoaData() {
  // Dynamic import to avoid circular dependencies and allow
  // the seed module to import from this file
  const { seedDoa } = await import('./seed')

  try {
    console.log('Checking doa data...')
    const result = await seedDoa({ deleteOrphans: false, dryRun: false })

    if (result.errors.length > 0) {
      // Log errors but don't throw - server should still start
      console.error('Seed completed with errors:', result.errors)
    } else if (result.inserted > 0 || result.updated > 0) {
      console.log(
        `Doa seed: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} unchanged (${result.duration}ms)`,
      )
    } else {
      console.log(
        `Doa data is up to date (${result.skipped} records, ${result.duration}ms)`,
      )
    }
  } catch (error) {
    // Log but don't throw - server should still start even if seeding fails
    // This prevents deployment failures due to transient DB issues
    console.error(
      'Doa seeding failed (non-fatal):',
      error instanceof Error ? error.message : error,
    )
  }
}

// Export for server startup
export async function startServer() {
  await applyMigrations()
  await seedDoaData()
  console.log('Server initialized')
}
