import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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
