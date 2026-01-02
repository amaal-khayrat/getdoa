import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

// ============================================
// DOA - Master prayer/supplication table
// ============================================
export const doa = pgTable(
  'doa',
  {
    // Primary key - slug as natural key (human-readable, already unique)
    slug: varchar('slug', { length: 255 }).primaryKey(),

    // Names (bilingual)
    nameMy: varchar('name_my', { length: 500 }).notNull(),
    nameEn: varchar('name_en', { length: 500 }).notNull(),

    // Arabic content
    content: text('content').notNull(),

    // References/sources (bilingual)
    referenceMy: varchar('reference_my', { length: 500 }),
    referenceEn: varchar('reference_en', { length: 500 }),

    // Translations/meanings (bilingual)
    meaningMy: text('meaning_my'),
    meaningEn: text('meaning_en'),

    // Categories (stored as JSONB array)
    categoryNames: jsonb('category_names').$type<string[]>().default([]).notNull(),

    // Descriptions (bilingual)
    descriptionMy: text('description_my'),
    descriptionEn: text('description_en'),

    // Context (bilingual)
    contextMy: text('context_my'),
    contextEn: text('context_en'),

    // Content hash for change detection (SHA-256)
    contentHash: varchar('content_hash', { length: 64 }).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Full-text search indexes
    index('doa_name_my_idx').on(table.nameMy),
    index('doa_name_en_idx').on(table.nameEn),
    // GIN index for JSONB array lookups
    index('doa_category_names_idx').using('gin', table.categoryNames),
    // Hash index for seed comparison
    index('doa_content_hash_idx').on(table.contentHash),
  ],
)

// Note: Doa relations defined in index.ts to avoid circular imports

// ============================================
// DOA IMAGE GENERATION TRACKING
// ============================================
export const doaImageGeneration = pgTable(
  'doa_image_generation',
  {
    // Use userId as primary key (one record per user)
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Track generation count for today
    generationsToday: integer('generations_today').default(0).notNull(),

    // Timestamp of the last generation (for daily reset logic)
    // Using timestamp instead of date to avoid timezone ambiguity
    lastGeneratedAt: timestamp('last_generated_at', { withTimezone: true }),

    // Total lifetime generations (for analytics)
    totalGenerations: integer('total_generations').default(0).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('doa_image_gen_last_at_idx').on(table.lastGeneratedAt)],
)

// ============================================
// DOA IMAGE GENERATION RELATIONS
// ============================================
export const doaImageGenerationRelations = relations(
  doaImageGeneration,
  ({ one }) => ({
    user: one(user, {
      fields: [doaImageGeneration.userId],
      references: [user.id],
    }),
  }),
)
