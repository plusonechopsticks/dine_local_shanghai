import { getDb } from "./server/db";
import { hostListings } from "./drizzle/schema";
import { like } from "drizzle-orm";

const profilePhotoUrl = "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882356/host-images/ifdaljpfkzdovtrq3pbj.jpg";

console.log("🔍 Finding Norika and Steven listing...");

const db = await getDb();
if (!db) {
  throw new Error("Database not available");
}

const listings = await db
  .select()
  .from(hostListings)
  .where(like(hostListings.hostName, "%Norika%"));

console.log(`Found ${listings.length} listings`);

if (listings.length === 0) {
  throw new Error("Norika listing not found!");
}

const listing = listings[0];
console.log(`  - ID: ${listing.id}, Host: ${listing.hostName}`);

console.log(`\n📝 Updating profile photo...`);

await db
  .update(hostListings)
  .set({
    profilePhotoUrl: profilePhotoUrl
  })
  .where(like(hostListings.hostName, "%Norika%"));

console.log("✅ Norika & Steven profile photo updated!");
console.log(`Profile photo URL: ${profilePhotoUrl}`);

process.exit(0);
