import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./server/_core/env";
import fs from "fs";

cloudinary.config({
  cloud_name: ENV.cloudinaryCloudName,
  api_key: ENV.cloudinaryApiKey,
  api_secret: ENV.cloudinaryApiSecret,
});

const buffer = fs.readFileSync("/home/ubuntu/upload/100.jpg");

const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "host-profiles",
      public_id: "dragon-xiaolong-profile-v2",
      overwrite: true,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    },
    (error, result) => {
      if (error) reject(error);
      else if (result) resolve(result as { secure_url: string });
      else reject(new Error("No result"));
    }
  );
  stream.end(buffer);
});

console.log("URL:", result.secure_url);
