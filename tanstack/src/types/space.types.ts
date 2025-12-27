import type { InferSelectModel } from 'drizzle-orm'
import type { space, spaceDoa } from '@/db/schema'

// Infer types from Drizzle schema
export type Space = InferSelectModel<typeof space>
export type SpaceDoa = InferSelectModel<typeof spaceDoa>

// Space with its doa items
export interface SpaceWithDoa extends Space {
  doaItems: SpaceDoa[]
}

// For creating a new space
export interface CreateSpaceInput {
  name: string
  icon?: string
  doaSlugs?: string[]
}

// For updating a space
export interface UpdateSpaceInput {
  name?: string
  icon?: string
}

// Space template for onboarding
export interface SpaceTemplate {
  id: string
  name: string
  nameMs: string
  description: string
  descriptionMs: string
  icon: string
  doaSlugs: string[]
}
