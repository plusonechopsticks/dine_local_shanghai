import { getDb } from "./server/db";
import { hostListings } from "./drizzle/schema";
import { like } from "drizzle-orm";

const profilePhotoUrl = "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882814/host-images/m953al1omf5zczdkum7h.jpg";
const cloudinaryUrls = [
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882814/host-images/m953al1omf5zczdkum7h.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882816/host-images/tprru9pocfkfdchwatw0.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882819/host-images/eippvkl9rbajx3gpjwyx.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882821/host-images/ujfy1gmzw3pdrhcjoq8v.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882824/host-images/aavo9glnluvnx5fawn0p.jpg"
];

console.log("🔍 Finding Shanghai Ayi listing...");

const db = await getDb();
if (!db) {
  throw new Error("Database not available");
}

const listings = await db
  .select()
  .from(hostListings)
  .where(like(hostListings.hostName, "%Ayi%"));

console.log(`Found ${listings.length} listings`);

if (listings.length === 0) {
  throw new Error("Ayi listing not found!");
}

const listing = listings[0];
console.log(`  - ID: ${listing.id}, Host: ${listing.hostName}`);

console.log(`\n📝 Updating with ${cloudinaryUrls.length} images...`);

await db
  .update(hostListings)
  .set({
    profilePhotoUrl: profilePhotoUrl,
    foodPhotoUrls: cloudinaryUrls
  })
  .where(like(hostListings.hostName, "%Ayi%"));

console.log("✅ Shanghai Ayi images updated!");
console.log(`Profile: ${profilePhotoUrl}`);
console.log(`Food photos: ${cloudinaryUrls.length} images`);

process.exit(0);
