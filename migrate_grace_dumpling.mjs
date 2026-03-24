import { uploadToCloudinary } from "./server/cloudinary.js";
import { readFile } from "fs/promises";
import mysql from "mysql2/promise";

const images = [
  "/home/ubuntu/upload/IMG_2886(1).jpeg",
  "/home/ubuntu/upload/IMG_9004.jpeg",
  "/home/ubuntu/upload/IMG_9370.jpeg"
];

console.log("🚀 Starting image migration for Grace Tong dumpling class...\n");

// Upload images to Cloudinary
const cloudinaryUrls = [];
for (const imagePath of images) {
  try {
    console.log(`📤 Uploading ${imagePath}...`);
    const buffer = await readFile(imagePath);
    const url = await uploadToCloudinary(buffer, "host-images");
    cloudinaryUrls.push(url);
    console.log(`✅ Uploaded: ${url}\n`);
  } catch (error) {
    console.error(`❌ Failed to upload ${imagePath}:`, error.message);
    process.exit(1);
  }
}

// Update database
console.log("💾 Updating database...");
const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Find Grace Tong's dumpling listing
const [listings] = await connection.query(
  "SELECT id, hostName, title FROM host_listings WHERE hostName = ? AND title LIKE ?",
  ["Grace Tong", "%Dumpling%"]
);

if (listings.length === 0) {
  console.error("❌ Grace Tong dumpling listing not found!");
  process.exit(1);
}

const listing = listings[0];
console.log(`Found listing: ${listing.title} (ID: ${listing.id})`);

// Update with new Cloudinary URLs
// Profile photo = first image, food photos = all 3 images
await connection.query(
  "UPDATE host_listings SET profilePhotoUrl = ?, foodPhotoUrls = ? WHERE id = ?",
  [cloudinaryUrls[0], JSON.stringify(cloudinaryUrls), listing.id]
);

await connection.end();

console.log("\n✅ Migration complete!");
console.log(`Profile photo: ${cloudinaryUrls[0]}`);
console.log(`Food photos: ${cloudinaryUrls.length} images`);
