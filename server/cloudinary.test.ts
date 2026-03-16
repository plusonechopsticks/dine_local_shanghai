import { describe, it, expect } from "vitest";
import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./_core/env";

describe("Cloudinary Integration", () => {
  it("should validate Cloudinary credentials by calling API", async () => {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: ENV.cloudinaryCloudName,
      api_key: ENV.cloudinaryApiKey,
      api_secret: ENV.cloudinaryApiSecret,
    });

    // Test by calling Cloudinary API to get account usage (lightweight endpoint)
    const result = await cloudinary.api.usage();
    
    // If credentials are valid, we should get usage data
    expect(result).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.credits).toBeDefined();
    
    console.log("✅ Cloudinary credentials validated successfully");
    console.log(`Plan: ${result.plan}, Credits used: ${result.credits.usage}`);
  }, 10000); // 10 second timeout for API call
});
