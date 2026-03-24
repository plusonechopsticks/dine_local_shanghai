import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { blogPosts, blogPostViews } from "../../drizzle/schema";
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

  recordView: publicProcedure
    .input(
      z.object({
        blogPostId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Check if view record exists for this blog post
      const existingView = await db
        .select()
        .from(blogPostViews)
        .where(eq(blogPostViews.blogPostId, input.blogPostId))
        .limit(1);

      if (existingView.length > 0) {
        // Increment existing view count
        await db
          .update(blogPostViews)
          .set({
            viewCount: existingView[0].viewCount + 1,
            lastViewedAt: new Date(),
          })
          .where(eq(blogPostViews.blogPostId, input.blogPostId));
      } else {
        // Create new view record
        await db.insert(blogPostViews).values({
          blogPostId: input.blogPostId,
          viewCount: 1,
          lastViewedAt: new Date(),
        });
      }

      return true;
    }),

  getViewCount: publicProcedure
    .input(
      z.object({
        blogPostId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;

      const view = await db
        .select()
        .from(blogPostViews)
        .where(eq(blogPostViews.blogPostId, input.blogPostId))
        .limit(1);

      return view[0]?.viewCount || 0;
    }),
});
