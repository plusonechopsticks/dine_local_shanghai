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
    if (post.slug === "home-dining-cheat-sheet-steven-to") {
      console.log(`\n=== ${post.title} ===`);
      
      // Extract all image URLs
      const imageRegex = /https:\/\/res\.cloudinary\.com\/[^\s"'<>]+/g;
      const matches = post.content.match(imageRegex);
      
      if (matches) {
        console.log(`Found ${matches.length} images:`);
        matches.forEach((url, idx) => {
          console.log(`\nImage ${idx + 1}:`);
          console.log(url);
        });
      } else {
        console.log("No Cloudinary images found");
      }
      
      // Also check for img tags
      const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
      let imgMatch;
      let imgCount = 0;
      while ((imgMatch = imgTagRegex.exec(post.content)) !== null) {
        imgCount++;
        console.log(`\nImg tag ${imgCount}: ${imgMatch[1]}`);
      }
    }
  }

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
