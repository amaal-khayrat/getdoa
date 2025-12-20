import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

import * as schema from './schema.ts'

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

// Export for server startup
export async function startServer() {
  await applyMigrations()
  // Additional server setup can go here
  console.log('Server initialized')
}
