import { describe, it, expect } from "vitest";
import Stripe from "stripe";

describe("Stripe Configuration", () => {
  it("should initialize Stripe with valid secret key", () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    expect(secretKey).toBeDefined();
    // Accept both test and live keys
    expect(secretKey).toMatch(/^sk_(test|live)_/);
    
    // Should not throw when creating Stripe instance
    const stripe = new Stripe(secretKey!, {
      apiVersion: "2026-01-28.clover" as any,
    });
    expect(stripe).toBeDefined();
  });

  it("should have publishable key configured", () => {
    const publishableKey = process.env.VITE_STRIPE_PUBLIC_KEY;
    expect(publishableKey).toBeDefined();
    // Accept both test and live keys
    expect(publishableKey).toMatch(/^pk_(test|live)_/);
  });
});
