import { migrateGraceDumplingImages } from "./server/migrate-images";

console.log("🚀 Starting Grace Tong dumpling image migration...\n");

migrateGraceDumplingImages()
  .then((result) => {
    console.log("\n✅ Migration successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
