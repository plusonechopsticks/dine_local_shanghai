import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { blogPosts, blogPostViews } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { postBlogToFacebook } from "../facebook";

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

  listAllPosts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
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

  createPost: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        authorName: z.string().default("+1 Chopsticks"),
        featuredImageUrl: z.string().optional(),
        tags: z.array(z.string()).default([]),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        published: z.boolean().default(false),
        postToFacebook: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { postToFacebook: shouldPostToFacebook, ...postData } = input;

      await db.insert(blogPosts).values({
        ...postData,
        publishedAt: postData.published ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const [created] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, postData.slug))
        .limit(1);

      if (shouldPostToFacebook && postData.published) {
        await postBlogToFacebook({
          title: postData.title,
          excerpt: postData.excerpt,
          slug: postData.slug,
          tags: postData.tags,
        });
      }

      return created;
    }),

  updatePost: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        authorName: z.string().optional(),
        featuredImageUrl: z.string().optional().nullable(),
        tags: z.array(z.string()).optional(),
        metaDescription: z.string().optional().nullable(),
        metaKeywords: z.string().optional().nullable(),
        published: z.boolean().optional(),
        postToFacebook: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { id, postToFacebook: shouldPostToFacebook, ...updates } = input;

      const [existing] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (!existing) throw new Error("Post not found");

      const isPublishing = updates.published === true && !existing.published;

      await db
        .update(blogPosts)
        .set({
          ...updates,
          publishedAt: isPublishing ? new Date() : existing.publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, id));

      const [updated] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (shouldPostToFacebook && updated.published) {
        await postBlogToFacebook({
          title: updated.title,
          excerpt: updated.excerpt,
          slug: updated.slug,
          tags: updated.tags,
        });
      }

      return updated;
    }),

  deletePost: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  postToFacebook: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      if (!post) throw new Error("Post not found");
      if (!post.published) throw new Error("Cannot share an unpublished post");

      const result = await postBlogToFacebook({
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        tags: post.tags,
      });

      return result;
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

  // Increment view count directly on the blog_posts table (mirrors host.incrementView)
  incrementView: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(blogPosts)
        .set({ viewCount: sql`viewCount + 1` })
        .where(eq(blogPosts.slug, input.slug));

      return { success: true };
    }),
});
