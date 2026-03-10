import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

type BlogPost = typeof blogPosts.$inferSelect;

export const blogRouter = router({
  listPosts: publicProcedure
    .input(
      z.object({
        published: z.boolean().optional().default(true),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.publishedAt));

      return posts;
    }),

  getPostBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const post = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.published, true)))
        .limit(1);

      return post[0] || null;
    }),

  getPostById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const post = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      return post[0] || null;
    }),
});
