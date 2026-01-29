import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createHostListing: vi.fn().mockResolvedValue({
    id: 1,
    hostName: "Test Host",
    email: "test@example.com",
    district: "Pudong",
    cuisineStyle: "Shanghainese (本帮菜)",
    status: "pending",
  }),
  getAllHostListings: vi.fn().mockResolvedValue([]),
  getHostListingById: vi.fn().mockResolvedValue(null),
  updateHostListingStatus: vi.fn().mockResolvedValue(true),
}));

// Mock the notification function
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the storage function
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://example.com/image.jpg" }),
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

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
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

describe("host.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully submits a host listing", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.host.submit({
      name: "Test Host",
      bio: "I love cooking and sharing my culture with travelers from around the world.",
      email: "test@example.com",
      district: "Pudong",
      availability: { saturday: ["dinner"], sunday: ["lunch", "dinner"] },
      maxGuests: 4,
      cuisineStyle: "Shanghainese (本帮菜)",
      menuDescription: "Traditional Shanghai dishes including xiaolongbao and hongshaorou.",
      foodPhotoUrls: [
        "https://example.com/photo1.jpg",
        "https://example.com/photo2.jpg",
        "https://example.com/photo3.jpg",
      ],
      profilePhotoUrl: "https://example.com/profile.jpg",
      pricePerPerson: 150,
      householdFeatures: [],
      otherHouseholdInfo: "",
    });

    expect(result.success).toBe(true);
    expect(result.listing).toBeDefined();
  });

  it("rejects submission with missing required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.host.submit({
        name: "",
        bio: "Short",
        email: "invalid-email",
        district: "",
        availability: {},
        cuisineStyle: "",
        menuDescription: "Short",
        foodPhotoUrls: [],
        pricePerPerson: 100,
      } as any)
    ).rejects.toThrow();
  });

  it("rejects submission with less than 3 food photos", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.host.submit({
        name: "Test Host",
        bio: "I love cooking and sharing my culture with travelers.",
        email: "test@example.com",
        district: "Pudong",
        availability: { saturday: ["dinner"] },
        cuisineStyle: "Home-style Chinese",
        menuDescription: "Traditional home-cooked Chinese dishes.",
        foodPhotoUrls: ["https://example.com/photo1.jpg"], // Only 1 photo
        pricePerPerson: 100,
      })
    ).rejects.toThrow();
  });
});

describe("host.listAll (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns listings for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.host.listAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array for non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.host.listAll();
    expect(result).toEqual([]);
  });
});

describe("upload.image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully uploads an image", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.upload.image({
      base64Data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      fileName: "test.png",
      contentType: "image/png",
    });

    expect(result.url).toBeDefined();
    expect(typeof result.url).toBe("string");
  });
});
