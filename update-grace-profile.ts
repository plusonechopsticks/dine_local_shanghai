import { getDb } from "./server/db";
import { hostListings } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const profilePhotoUrl = "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882183/host-images/vaioaycyfqjqqtxng3gl.jpg";

console.log("🔍 Finding all Grace Tong listings...");

const db = await getDb();
if (!db) {
  throw new Error("Database not available");
}

const listings = await db
  .select()
  .from(hostListings)
  .where(eq(hostListings.hostName, "Grace Tong"));

console.log(`Found ${listings.length} Grace Tong listings`);
listings.forEach(listing => {
  console.log(`  - ID: ${listing.id}, Title: ${listing.title}`);
});

console.log(`\n📝 Updating all listings with profile photo...`);

for (const listing of listings) {
  await db
    .update(hostListings)
    .set({
      profilePhotoUrl: profilePhotoUrl
    })
    .where(eq(hostListings.id, listing.id));
  
  console.log(`✅ Updated listing ${listing.id}`);
}

console.log("\n✅ All Grace Tong listings updated with profile photo!");
console.log(`Profile photo URL: ${profilePhotoUrl}`);

process.exit(0);
