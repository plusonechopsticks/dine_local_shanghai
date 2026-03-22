import { getDb } from "./server/db.ts";
import { blogPosts } from "./drizzle/schema.ts";

async function main() {
  const db = await getDb();
  if (!db) process.exit(1);

  const posts = await db.select().from(blogPosts);
  for (const post of posts) {
    if (post.slug === "home-dining-cheat-sheet-steven-to") {
      const imageRegex = /https:\/\/res\.cloudinary\.com\/[^\s"'<>]+/g;
      const matches = post.content.match(imageRegex);
      if (matches) {
        console.log(`Found ${matches.length} images:`);
        matches.forEach((url, i) => {
          console.log(`${i + 1}. ${url}`);
        });
      }
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
