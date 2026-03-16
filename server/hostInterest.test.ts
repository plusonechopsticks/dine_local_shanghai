import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createHostInterest: vi.fn().mockResolvedValue({
    id: 1,
    name: "Test Host",
    district: "Xuhui",
    contact: "test@example.com",
    createdAt: new Date(),
  }),
  getAllHostInterests: vi.fn().mockResolvedValue([]),
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("hostInterest.submit", () => {
  it("accepts valid host interest submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.hostInterest.submit({
      name: "Test Host",
      district: "Xuhui",
      contact: "test@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.interest).toBeDefined();
    expect(result.interest?.name).toBe("Test Host");
    expect(result.interest?.district).toBe("Xuhui");
    expect(result.interest?.contact).toBe("test@example.com");
  });

  it("rejects submission with missing name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.hostInterest.submit({
        name: "",
        district: "Xuhui",
        contact: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with missing district", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.hostInterest.submit({
        name: "Test Host",
        district: "",
        contact: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with missing contact", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.hostInterest.submit({
        name: "Test Host",
        district: "Xuhui",
        contact: "",
      })
    ).rejects.toThrow();
  });
});
