import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import { typeid } from 'typeid-js'
import { user } from './auth'
import { doa } from './doa'

// ============================================
// DOA LIST - Main entity for prayer lists
// ============================================
export const doaList = pgTable(
  'doa_list',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('doal').toString()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Content
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),

    // Display settings
    showTranslations: boolean('show_translations').default(true).notNull(),
    translationLayout: varchar('translation_layout', { length: 20 })
      .default('grouped')
      .notNull(), // 'grouped' | 'interleaved'
    language: varchar('language', { length: 5 }).default('en').notNull(), // 'en' | 'my'

    // Status & Visibility
    status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft' | 'published'
    visibility: varchar('visibility', { length: 20 })
      .default('private')
      .notNull(), // 'public' | 'private'

    // Stats (denormalized for performance)
    viewCount: integer('view_count').default(0).notNull(),
    exportCount: integer('export_count').default(0).notNull(),
    favoriteCount: integer('favorite_count').default(0).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    publishedAt: timestamp('published_at'),
  },
  (table) => [
    index('doa_list_user_id_idx').on(table.userId),
    index('doa_list_status_idx').on(table.status),
    index('doa_list_visibility_idx').on(table.visibility),
    index('doa_list_created_at_idx').on(table.createdAt),
    // Composite index for public lists discovery
    index('doa_list_public_published_idx').on(
      table.status,
      table.visibility,
      table.createdAt,
    ),
  ],
)

// ============================================
// DOA LIST ITEM - Junction table linking doaList to doa
// ============================================
export const doaListItem = pgTable(
  'doa_list_item',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('dli').toString()),
    listId: varchar('list_id', { length: 50 })
      .notNull()
      .references(() => doaList.id, { onDelete: 'cascade' }),
    doaSlug: varchar('doa_slug', { length: 255 })
      .notNull()
      .references(() => doa.slug, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('doa_list_item_list_id_idx').on(table.listId),
    index('doa_list_item_doa_slug_idx').on(table.doaSlug),
    index('doa_list_item_order_idx').on(table.listId, table.order),
    unique('doa_list_item_list_doa_unique').on(table.listId, table.doaSlug),
  ],
)

// ============================================
// SAVED DOA - Individual duas favorited by user
// ============================================
export const savedDoa = pgTable(
  'saved_doa',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('sdoa').toString()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    doaSlug: varchar('doa_slug', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('saved_doa_user_id_idx').on(table.userId),
    unique('saved_doa_user_slug_unique').on(table.userId, table.doaSlug),
  ],
)

// ============================================
// FAVORITE LIST - Users favoriting other users' lists
// ============================================
export const favoriteList = pgTable(
  'favorite_list',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('fav').toString()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    listId: varchar('list_id', { length: 50 })
      .notNull()
      .references(() => doaList.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('favorite_list_user_id_idx').on(table.userId),
    index('favorite_list_list_id_idx').on(table.listId),
    unique('favorite_list_user_list_unique').on(table.userId, table.listId),
  ],
)

// ============================================
// EXPORT LOG - Track exports for analytics
// ============================================
export const exportLog = pgTable(
  'export_log',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('expl').toString()),
    listId: varchar('list_id', { length: 50 })
      .notNull()
      .references(() => doaList.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    exportedAt: timestamp('exported_at').defaultNow().notNull(),
    ipAddress: varchar('ip_address', { length: 50 }),
    userAgent: varchar('user_agent', { length: 500 }),
  },
  (table) => [
    index('export_log_list_id_idx').on(table.listId),
    index('export_log_user_id_idx').on(table.userId),
    index('export_log_exported_at_idx').on(table.exportedAt),
  ],
)

// ============================================
// DOA LIST RELATIONS
// ============================================
export const doaListRelations = relations(doaList, ({ one, many }) => ({
  user: one(user, {
    fields: [doaList.userId],
    references: [user.id],
  }),
  items: many(doaListItem),
  favorites: many(favoriteList),
  exports: many(exportLog),
}))

export const doaListItemRelations = relations(doaListItem, ({ one }) => ({
  list: one(doaList, {
    fields: [doaListItem.listId],
    references: [doaList.id],
  }),
  doa: one(doa, {
    fields: [doaListItem.doaSlug],
    references: [doa.slug],
  }),
}))

export const savedDoaRelations = relations(savedDoa, ({ one }) => ({
  user: one(user, {
    fields: [savedDoa.userId],
    references: [user.id],
  }),
  doa: one(doa, {
    fields: [savedDoa.doaSlug],
    references: [doa.slug],
  }),
}))

export const favoriteListRelations = relations(favoriteList, ({ one }) => ({
  user: one(user, {
    fields: [favoriteList.userId],
    references: [user.id],
  }),
  list: one(doaList, {
    fields: [favoriteList.listId],
    references: [doaList.id],
  }),
}))

export const exportLogRelations = relations(exportLog, ({ one }) => ({
  list: one(doaList, {
    fields: [exportLog.listId],
    references: [doaList.id],
  }),
  user: one(user, {
    fields: [exportLog.userId],
    references: [user.id],
  }),
}))
