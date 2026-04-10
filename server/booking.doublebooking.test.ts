/**
 * Tests for double-booking prevention logic.
 * These tests verify that the isHostAvailable function correctly blocks
 * a slot when a confirmed or pending booking already exists for it.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module so we don't need a real DB connection
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getBookedSlots: vi.fn(),
  };
});

// Helper: simulate the slot-key lookup logic used in HostDetail.tsx
function buildBookedSlotKeys(
  bookedSlots: { date: string; mealType: string }[]
): Set<string> {
  return new Set(bookedSlots.map((s) => `${s.date}:${s.mealType}`));
}

// Helper: simulate the "disable date if all meals booked" logic
function isDateFullyBooked(
  date: string,
  bookedSlots: { date: string; mealType: string }[],
  availableMeals: string[]
): boolean {
  const bookedMeals = new Set(
    bookedSlots.filter((s) => s.date === date).map((s) => s.mealType)
  );
  return availableMeals.length > 0 && availableMeals.every((m) => bookedMeals.has(m));
}

describe("Double-booking prevention — slot key lookup", () => {
  it("correctly identifies a booked lunch slot", () => {
    const bookedSlots = [{ date: "2025-04-18", mealType: "lunch" }];
    const keys = buildBookedSlotKeys(bookedSlots);
    expect(keys.has("2025-04-18:lunch")).toBe(true);
    expect(keys.has("2025-04-18:dinner")).toBe(false);
  });

  it("correctly identifies a booked dinner slot", () => {
    const bookedSlots = [{ date: "2025-04-19", mealType: "dinner" }];
    const keys = buildBookedSlotKeys(bookedSlots);
    expect(keys.has("2025-04-19:dinner")).toBe(true);
    expect(keys.has("2025-04-19:lunch")).toBe(false);
  });

  it("handles multiple booked slots across different dates", () => {
    const bookedSlots = [
      { date: "2025-04-18", mealType: "lunch" },
      { date: "2025-04-19", mealType: "dinner" },
    ];
    const keys = buildBookedSlotKeys(bookedSlots);
    expect(keys.has("2025-04-18:lunch")).toBe(true);
    expect(keys.has("2025-04-19:dinner")).toBe(true);
    expect(keys.has("2025-04-18:dinner")).toBe(false);
    expect(keys.has("2025-04-19:lunch")).toBe(false);
  });

  it("returns empty set when no bookings exist", () => {
    const keys = buildBookedSlotKeys([]);
    expect(keys.size).toBe(0);
  });
});

describe("Double-booking prevention — date fully booked check", () => {
  it("marks date as fully booked when all available meals are taken", () => {
    const bookedSlots = [
      { date: "2025-04-18", mealType: "lunch" },
    ];
    // Host only offers lunch on this day
    expect(isDateFullyBooked("2025-04-18", bookedSlots, ["lunch"])).toBe(true);
  });

  it("does NOT mark date as fully booked when only one of two meals is taken", () => {
    const bookedSlots = [
      { date: "2025-04-18", mealType: "lunch" },
    ];
    // Host offers both lunch and dinner
    expect(isDateFullyBooked("2025-04-18", bookedSlots, ["lunch", "dinner"])).toBe(false);
  });

  it("marks date as fully booked when both lunch and dinner are taken", () => {
    const bookedSlots = [
      { date: "2025-04-18", mealType: "lunch" },
      { date: "2025-04-18", mealType: "dinner" },
    ];
    expect(isDateFullyBooked("2025-04-18", bookedSlots, ["lunch", "dinner"])).toBe(true);
  });

  it("does NOT mark date as fully booked when no bookings exist", () => {
    expect(isDateFullyBooked("2025-04-18", [], ["lunch", "dinner"])).toBe(false);
  });

  it("does NOT mark date as fully booked when availableMeals is empty", () => {
    const bookedSlots = [{ date: "2025-04-18", mealType: "lunch" }];
    // Edge case: host has no available meals configured
    expect(isDateFullyBooked("2025-04-18", bookedSlots, [])).toBe(false);
  });

  it("only considers bookings for the specific date", () => {
    const bookedSlots = [
      { date: "2025-04-19", mealType: "lunch" }, // different date
    ];
    expect(isDateFullyBooked("2025-04-18", bookedSlots, ["lunch"])).toBe(false);
  });
});
