import { getDb } from "./server/db";
import { hostListings } from "./drizzle/schema";
import { eq, and } from "drizzle-orm";

const cloudinaryUrls = [
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882118/host-images/lletohvybcivoacisryq.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882120/host-images/stacv7tg6rlwa6ltigqk.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882122/host-images/enerun7rg2wvkrnq29ef.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882124/host-images/gmwcadmks0fulwavwo6r.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882126/host-images/zxols0urs8x0gd1szuzm.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769882128/host-images/rrjgtrzmwnq9sd6gk1pj.jpg"
];

console.log("🔍 Finding Grace Tong fusion listing...");

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

// Find the fusion one (not dumpling)
const fusionListing = listings.find(l => 
  !l.title?.toLowerCase().includes("dumpling")
);

if (!fusionListing) {
  throw new Error("Fusion listing not found!");
}

console.log(`\n✅ Found fusion listing: ID ${fusionListing.id}`);
console.log(`📝 Updating with ${cloudinaryUrls.length} Cloudinary URLs...`);

await db
  .update(hostListings)
  .set({
    profilePhotoUrl: cloudinaryUrls[0],
    foodPhotoUrls: cloudinaryUrls
  })
  .where(eq(hostListings.id, fusionListing.id));

console.log("✅ Update complete!");

const updated = await db
  .select()
  .from(hostListings)
  .where(eq(hostListings.id, fusionListing.id));

console.log("\n📸 Updated URLs:");
console.log(`Profile: ${updated[0].profilePhotoUrl}`);
console.log(`Food photos (${updated[0].foodPhotoUrls?.length} images)`);

process.exit(0);
