import { getDb } from "./server/db";
import { hostListings } from "./drizzle/schema";
import { eq, and, like } from "drizzle-orm";

const cloudinaryUrls = [
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881954/host-images/hdrqhnzwspp0cmusbqqn.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881958/host-images/xllmu9jdhd7sjxotnsqp.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881963/host-images/o9n0ifnj6oxg4pvlaiep.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881968/host-images/h8ymuocquwyrjiaumfvu.jpg"
];

console.log("🔍 Finding Norika and Steven listing...");

const db = await getDb();
if (!db) {
  throw new Error("Database not available");
}

const listings = await db
  .select()
  .from(hostListings)
  .where(like(hostListings.hostName, "%Norika%"));

console.log(`Found ${listings.length} listings matching Norika`);
listings.forEach(listing => {
  console.log(`  - ID: ${listing.id}, Host: ${listing.hostName}, Title: ${listing.title}`);
});

if (listings.length === 0) {
  throw new Error("Norika listing not found!");
}

const norikaListing = listings[0];
console.log(`\n✅ Found listing: ID ${norikaListing.id}`);
console.log(`📝 Updating with ${cloudinaryUrls.length} Cloudinary URLs...`);

await db
  .update(hostListings)
  .set({
    profilePhotoUrl: cloudinaryUrls[0],
    foodPhotoUrls: cloudinaryUrls
  })
  .where(eq(hostListings.id, norikaListing.id));

console.log("✅ Update complete!");

const updated = await db
  .select()
  .from(hostListings)
  .where(eq(hostListings.id, norikaListing.id));

console.log("\n📸 Updated URLs:");
console.log(`Profile: ${updated[0].profilePhotoUrl}`);
console.log(`Food photos (${updated[0].foodPhotoUrls?.length} images)`);

process.exit(0);
