import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { applyMigrations } from './db'
import { seedDoa } from './db/seed'

// Top-level initialization: Runs once on server startup
console.log('🚀 Server initializing...')

// Only run migrations in production or staging
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  try {
    await applyMigrations()
    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Database migrations failed:', error)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
} else {
  console.log('🔄 Skipping database migrations in development environment')
  console.log('💡 Use `pnpm drizzle-kit push` for development schema changes')
}

// Always seed doa data (idempotent - safe to run on every startup)
try {
  console.log('🌱 Checking doa data...')
  const result = await seedDoa({ deleteOrphans: true, dryRun: false })

  if (result.errors.length > 0) {
    console.error('⚠️ Seed completed with errors:', result.errors)
  } else if (result.inserted > 0 || result.updated > 0) {
    console.log(
      `✅ Doa seed: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} unchanged (${result.duration}ms)`,
    )
  } else {
    console.log(
      `✅ Doa data is up to date (${result.skipped} records, ${result.duration}ms)`,
    )
  }
} catch (error) {
  // Log but don't crash - server should still start
  console.error(
    '⚠️ Doa seeding failed (non-fatal):',
    error instanceof Error ? error.message : error,
  )
}

// TypeScript context augmentation for passing DB instance to routes
declare module '@tanstack/react-start' {
  interface Register {
    server: {
      requestContext: {
        // Add any request-specific context here if needed
        // The DB connection is already available via import from './db'
      }
    }
  }
}

export default createServerEntry({
  async fetch(request) {
    // Per-request handler
    return handler.fetch(request, {
      context: {} // Pass request-specific context here if needed
    })
  },
})