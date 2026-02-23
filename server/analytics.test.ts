import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { trackPageView, getPageViewsAnalytics, getPageViewsByType } from "./db";
import { getDb } from "./db";
import { pageViews } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Analytics Functions", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
    // Clean up test data before running tests
    await db.delete(pageViews).where(eq(pageViews.pageType, "home"));
  });

  afterAll(async () => {
    // Clean up test data after running tests
    if (db) {
      await db.delete(pageViews).where(eq(pageViews.pageType, "home"));
    }
  });

  it("should track page view for home page", async () => {
    await trackPageView("home");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select()
      .from(pageViews)
      .where(eq(pageViews.pageType, "home"));
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].pageType).toBe("home");
    expect(result[0].viewCount).toBeGreaterThanOrEqual(1);
  });

  it("should increment view count when tracking same page multiple times", async () => {
    // Clear previous data
    await db.delete(pageViews).where(eq(pageViews.pageType, "browse_hosts"));
    
    await trackPageView("browse_hosts");
    await trackPageView("browse_hosts");
    
    const result = await db
      .select()
      .from(pageViews)
      .where(eq(pageViews.pageType, "browse_hosts"));
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].viewCount).toBe(2);
  });

  it("should track host detail page views with hostListingId", async () => {
    // Clear previous data
    await db.delete(pageViews).where(eq(pageViews.pageType, "host_detail"));
    
    await trackPageView("host_detail", 1);
    
    const result = await db
      .select()
      .from(pageViews)
      .where(eq(pageViews.pageType, "host_detail"));
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].hostListingId).toBe(1);
    expect(result[0].viewCount).toBeGreaterThanOrEqual(1);
  });

  it("should retrieve analytics data for last 30 days", async () => {
    // Add some test data
    await trackPageView("home");
    await trackPageView("browse_hosts");
    await trackPageView("become_host");
    
    const result = await getPageViewsAnalytics(30);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("should retrieve page type specific analytics", async () => {
    // Add test data
    await trackPageView("home");
    await trackPageView("home");
    
    const result = await getPageViewsByType("home", 30);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].pageType).toBe("home");
  });

  it("should handle become_host page tracking", async () => {
    // Clear previous data
    await db.delete(pageViews).where(eq(pageViews.pageType, "become_host"));
    
    await trackPageView("become_host");
    
    const result = await db
      .select()
      .from(pageViews)
      .where(eq(pageViews.pageType, "become_host"));
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].pageType).toBe("become_host");
  });
});
