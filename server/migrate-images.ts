import { getDb } from "./db";
import { hostListings } from "../drizzle/schema";
import { eq, and, like } from "drizzle-orm";

export async function migrateGraceDumplingImages() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const cloudinaryUrls = [
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881401/host-images/vpwz3itks0vllkudk7s5.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881405/host-images/rdqdicxlvgx5v0vctaia.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881409/host-images/jzhgvwqjv14rvy17mztr.jpg"
  ];

  console.log("🔍 Finding Grace Tong dumpling listing...");
  
  // First, get all Grace Tong listings to see what we have
  const graceListing = await db
    .select()
    .from(hostListings)
    .where(eq(hostListings.hostName, "Grace Tong"));
  
  console.log(`Found ${graceListing.length} Grace Tong listings`);
  graceListing.forEach(listing => {
    console.log(`  - ID: ${listing.id}, Title: ${listing.title}`);
  });

  // Find the dumpling one
  const dumplingListing = graceListing.find(l => 
    l.title?.toLowerCase().includes("dumpling")
  );

  if (!dumplingListing) {
    throw new Error("Dumpling listing not found!");
  }

  console.log(`\n✅ Found dumpling listing: ID ${dumplingListing.id}`);
  console.log(`📝 Updating with Cloudinary URLs...`);

  // Update the listing
  await db
    .update(hostListings)
    .set({
      profilePhotoUrl: cloudinaryUrls[0],
      foodPhotoUrls: cloudinaryUrls
    })
    .where(eq(hostListings.id, dumplingListing.id));

  console.log("✅ Update complete!");
  
  // Verify the update
  const updated = await db
    .select()
    .from(hostListings)
    .where(eq(hostListings.id, dumplingListing.id));
  
  console.log("\n📸 Updated URLs:");
  console.log(`Profile: ${updated[0].profilePhotoUrl}`);
  console.log(`Food photos: ${updated[0].foodPhotoUrls}`);
  
  return updated[0];
}
