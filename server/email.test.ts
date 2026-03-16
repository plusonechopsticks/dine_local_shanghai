import { describe, it, expect } from "vitest";
import nodemailer from "nodemailer";

describe("Email Configuration", () => {
  it("should have valid Gmail credentials configured", async () => {
    // Check that environment variables are set
    expect(process.env.EMAIL_USER).toBeDefined();
    expect(process.env.EMAIL_PASSWORD).toBeDefined();
    expect(process.env.EMAIL_USER).toContain("@");
    
    // Verify credentials by creating a transporter and verifying connection
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // This will throw an error if credentials are invalid
    await transporter.verify();
    
    expect(true).toBe(true); // If we get here, credentials are valid
  }, 30000); // 30 second timeout for network request
});
