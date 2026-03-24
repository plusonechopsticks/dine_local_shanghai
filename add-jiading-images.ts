import { getDb, getHostListingById, updateHostListing } from "./server/db";

const jiading_ayi_id = 2; // Jiading Ayi's host listing ID

const newImageUrls = [
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241455/jiading-ayi-menu/yj9xk6vfy1si2yt1ukg5.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241458/jiading-ayi-menu/kmta7uxsahmzt6vkqfvg.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241461/jiading-ayi-menu/khquvqbpsyzixiubvkhc.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241465/jiading-ayi-menu/qsh5us9z7dhthm5lokwb.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241467/jiading-ayi-menu/wsh8yautdqbdq7q9ocjo.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241470/jiading-ayi-menu/ujvowhfai0aehimvkoiw.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241473/jiading-ayi-menu/k5qcozuughkofuapsdw8.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241476/jiading-ayi-menu/w9idwxw617adtwpi39o4.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/v1774241480/jiading-ayi-menu/aurtchub7nwfjcdtguj4.jpg"
];

async function addImages() {
  try {
    // Get current host listing
    const result = await getHostListingById(jiading_ayi_id);

    if (!result) {
      console.error("❌ Jiading Ayi host listing not found");
      return;
    }

    console.log("📸 Current images:", result.images);
    
    // Parse existing images
    const existingImages = result.images ? JSON.parse(result.images) : [];
    console.log(`✅ Found ${existingImages.length} existing images`);

    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];
    console.log(`📊 Total images after adding: ${allImages.length}`);

    // Update the host listing with all images
    await updateHostListing(jiading_ayi_id, {
      images: JSON.stringify(allImages)
    });

    console.log("✅ Successfully added 9 new images to Jiading Ayi's profile!");
    console.log(`\n📸 Image sequence (total ${allImages.length}):`);
    allImages.forEach((url, i) => {
      console.log(`  ${i}: ${url.substring(0, 80)}...`);
    });
  } catch (error) {
    console.error("❌ Error adding images:", error);
  }
}

addImages();
