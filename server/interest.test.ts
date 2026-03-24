import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createInterestSubmission: vi.fn().mockResolvedValue({
    id: 1,
    name: "Test User",
    email: "test@example.com",
    interestType: "traveler",
    message: "Test message",
    createdAt: new Date(),
  }),
  getAllInterestSubmissions: vi.fn().mockResolvedValue([]),
}));

// Mock the notification function
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("interest.submit", () => {
  it("successfully submits traveler interest", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.interest.submit({
      name: "Test User",
      email: "test@example.com",
      interestType: "traveler",
      message: "I'm interested in visiting Shanghai",
    });

    expect(result.success).toBe(true);
    expect(result.submission).toBeDefined();
    expect(result.submission?.name).toBe("Test User");
  });

  it("successfully submits host interest", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.interest.submit({
      name: "Host Family",
      email: "host@example.com",
      interestType: "host",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.interest.submit({
        name: "Test User",
        email: "invalid-email",
        interestType: "traveler",
      })
    ).rejects.toThrow();
  });

  it("rejects empty name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.interest.submit({
        name: "",
        email: "test@example.com",
        interestType: "traveler",
      })
    ).rejects.toThrow();
  });
});

describe("interest.list", () => {
  it("returns empty array for non-admin users", async () => {
    const ctx = createPublicContext();
    ctx.user = {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(ctx);

    const result = await caller.interest.list();
    expect(result).toEqual([]);
  });

  it("returns submissions for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.interest.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
