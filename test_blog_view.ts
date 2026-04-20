import { getDb } from "./server/db";
import { blogPosts } from "./drizzle/schema";
import { sql, eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) { console.error("No DB"); process.exit(1); }

  const posts = await db.select({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title, viewCount: blogPosts.viewCount }).from(blogPosts);
  console.log("Current blog post view counts:");
  posts.forEach(p => console.log(`  [${p.id}] ${p.slug}: ${p.viewCount} views`));

  if (posts.length > 0) {
    await db.update(blogPosts).set({ viewCount: sql`viewCount + 1` }).where(eq(blogPosts.slug, posts[0].slug));
    const updated = await db.select({ viewCount: blogPosts.viewCount }).from(blogPosts).where(eq(blogPosts.slug, posts[0].slug)).limit(1);
    console.log(`\n✅ After increment: "${posts[0].slug}" viewCount = ${updated[0].viewCount}`);
  }

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
