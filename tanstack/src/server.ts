import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { startServer } from './db'

// Top-level initialization: Runs once on server startup
console.log('🚀 Server initializing...')

// Only run migrations in production or staging
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  try {
    await startServer()
    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Database migrations failed:', error)
    // In production, you might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
} else {
  console.log('🔄 Skipping database migrations in development environment')
  console.log('💡 Use `pnpm drizzle-kit push` for development schema changes')
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