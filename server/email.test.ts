import { describe, it, expect, beforeAll } from "vitest";
import { sendEmail } from "./email";

describe("Email Service - Resend Integration", () => {
  beforeAll(() => {
    // Verify environment variables are set
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM environment variable is not set");
    }
  });

  it("should have valid Resend API key configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it("should have valid EMAIL_FROM configured", () => {
    expect(process.env.EMAIL_FROM).toBeDefined();
    expect(process.env.EMAIL_FROM).toMatch(/@/);
  });

  it("should send test email successfully via Resend API", async () => {
    const result = await sendEmail({
      to: "onboarding@resend.dev",
      subject: "Test Email from +1 Chopsticks",
      html: "<p>This is a test email to verify Resend API integration is working correctly.</p>",
    });

    expect(result).toBe(true);
  });
});
