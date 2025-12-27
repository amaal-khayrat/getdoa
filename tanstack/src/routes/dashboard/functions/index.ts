import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db } from "@/db";
import { space, spaceDoa } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import type { SpaceWithDoa, CreateSpaceInput } from "@/types/space.types";

// ============================================
// Auth Helper
// ============================================

async function requireAuth(expectedUserId?: string) {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    throw new Error("Unauthorized: Please sign in to perform this action");
  }

  if (expectedUserId && session.user.id !== expectedUserId) {
    throw new Error("Unauthorized: User ID mismatch");
  }

  return session;
}

// ============================================
// Space Functions
// ============================================

// Get all spaces for a user
export const getUserSpaces = createServerFn({
  method: "GET",
})
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<SpaceWithDoa[]> => {
    await requireAuth(data.userId);

    const spaces = await db.query.space.findMany({
      where: eq(space.userId, data.userId),
      with: {
        doaItems: {
          orderBy: [asc(spaceDoa.order)],
        },
      },
      orderBy: [desc(space.createdAt)],
    });

    return spaces;
  });

// Check if user has any spaces (for onboarding)
export const checkUserHasSpaces = createServerFn({
  method: "GET",
})
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ hasSpaces: boolean }> => {
    await requireAuth(data.userId);

    const existingSpace = await db.query.space.findFirst({
      where: eq(space.userId, data.userId),
      columns: { id: true },
    });

    return { hasSpaces: !!existingSpace };
  });

// Create a new space
export const createSpace = createServerFn({
  method: "POST",
})
  .inputValidator((data: { userId: string; input: CreateSpaceInput }) => data)
  .handler(async ({ data }): Promise<SpaceWithDoa> => {
    await requireAuth(data.userId);

    const { userId, input } = data;

    const [newSpace] = await db
      .insert(space)
      .values({
        userId,
        name: input.name,
        icon: input.icon || "BookOpen",
      })
      .returning();

    // If template slugs provided, add them to the space
    if (input.doaSlugs?.length) {
      await db.insert(spaceDoa).values(
        input.doaSlugs.map((slug, index) => ({
          spaceId: newSpace.id,
          doaSlug: slug,
          order: index,
        }))
      );
    }

    // Fetch the complete space with doa items
    const completeSpace = await db.query.space.findFirst({
      where: eq(space.id, newSpace.id),
      with: {
        doaItems: {
          orderBy: [asc(spaceDoa.order)],
        },
      },
    });

    return completeSpace!;
  });

// Add a doa to a space
export const addDoaToSpace = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: { spaceId: string; userId: string; doaSlug: string }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId);

    const { spaceId, userId, doaSlug } = data;

    // Verify ownership
    const existingSpace = await db.query.space.findFirst({
      where: and(eq(space.id, spaceId), eq(space.userId, userId)),
    });

    if (!existingSpace) {
      throw new Error("Space not found");
    }

    // Get max order
    const existingDoa = await db.query.spaceDoa.findMany({
      where: eq(spaceDoa.spaceId, spaceId),
      orderBy: [desc(spaceDoa.order)],
      limit: 1,
    });

    const maxOrder = existingDoa[0]?.order ?? -1;

    try {
      await db.insert(spaceDoa).values({
        spaceId,
        doaSlug,
        order: maxOrder + 1,
      });
      return { success: true };
    } catch {
      // Unique constraint violation means it's already added
      return { success: false };
    }
  });

// Remove a doa from a space
export const removeDoaFromSpace = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: { spaceId: string; userId: string; doaSlug: string }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId);

    const { spaceId, userId, doaSlug } = data;

    // Verify ownership
    const existingSpace = await db.query.space.findFirst({
      where: and(eq(space.id, spaceId), eq(space.userId, userId)),
    });

    if (!existingSpace) {
      throw new Error("Space not found");
    }

    await db
      .delete(spaceDoa)
      .where(and(eq(spaceDoa.spaceId, spaceId), eq(spaceDoa.doaSlug, doaSlug)));

    return { success: true };
  });
