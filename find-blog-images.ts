import { getDb } from "./server/db.ts";
import { blogPosts } from "./drizzle/schema.ts";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  const posts = await db.select().from(blogPosts);
  
  for (const post of posts) {
    console.log(`\n=== ${post.title} ===`);
    console.log(`Slug: ${post.slug}`);
    console.log(`Featured Image: ${post.featuredImage}`);
    if (post.content && post.content.includes("cloudinary")) {
      console.log("Contains Cloudinary images");
      // Extract image URLs
      const imageMatches = post.content.match(/https:\/\/res\.cloudinary\.com\/[^\s"'<>]+/g);
      if (imageMatches) {
        imageMatches.forEach((url, idx) => {
          console.log(`  Image ${idx + 1}: ${url}`);
        });
      }
    }
  }

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
