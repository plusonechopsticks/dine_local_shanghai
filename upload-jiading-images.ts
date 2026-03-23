import fs from "fs";
import { uploadToCloudinary } from "./server/cloudinary";

const images = [
  "00JIadingAyiSpring2026Menu.png",
  "01BambooShootswithPickledPork.jpg",
  "02Trad.ShanghaineseSmokedFish.jpg",
  "03SweetandSourPorkRibs.jpg",
  "04GardenGreenswithDicedTofu.jpg",
  "05HomemadeWanton.jpg",
  "06HomemadeFishBall.jpg",
  "07WhiteCutChicken.jpg",
  "08GlutinousRiceBallDessert.jpg",
];

async function uploadImages() {
  console.log("📸 Starting Jiading Ayi image uploads to Cloudinary...\n");
  const urls: string[] = [];

  for (const image of images) {
    const filePath = `/home/ubuntu/upload/${image}`;
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      console.log(`📤 Uploading ${image}...`);
      const url = await uploadToCloudinary(buffer, "jiading-ayi-menu");
      console.log(`✅ ${image} → ${url}\n`);
      urls.push(url);
    } catch (error) {
      console.error(`❌ Failed to upload ${image}:`, error);
    }
  }

  console.log("\n🎉 All uploads complete!");
  console.log("\nCloudinary URLs (in order):");
  urls.forEach((url, i) => {
    console.log(`${i}: ${url}`);
  });

  // Save to file for reference
  fs.writeFileSync("jiading-image-urls.json", JSON.stringify(urls, null, 2));
  console.log("\n✅ URLs saved to jiading-image-urls.json");
}

uploadImages().catch(console.error);
