import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./_core/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.cloudinaryCloudName,
  api_key: ENV.cloudinaryApiKey,
  api_secret: ENV.cloudinaryApiSecret,
});

/**
 * Upload image to Cloudinary
 * @param buffer Image buffer
 * @param folder Folder name in Cloudinary (e.g., "host-images")
 * @returns Public URL of uploaded image
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "host-images"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" }, // Limit max size
          { quality: "auto" }, // Auto quality optimization
          { fetch_format: "auto" }, // Auto format (WebP when supported)
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Upload failed: no result returned"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 * @param publicId Public ID of the image (extracted from URL)
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
