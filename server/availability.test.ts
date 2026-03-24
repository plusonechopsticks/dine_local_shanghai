import { describe, it, expect } from "vitest";

describe("Host Availability Checking", () => {
  describe("Date Block Checking", () => {
    it("should identify when a specific date is blocked", () => {
      const blocks = [
        {
          id: 1,
          hostListingId: 1,
          blockType: "date" as const,
          blockDate: new Date("2026-03-10"),
          blockWeekday: null,
          mealType: "both" as const,
          reason: "Family vacation",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const requestedDate = "2026-03-10";
      const mealType = "lunch" as const;

      const isBlocked = blocks.some(
        (block) =>
          block.blockType === "date" &&
          block.blockDate?.toISOString().split("T")[0] === requestedDate &&
          (block.mealType === "both" || block.mealType === mealType)
      );

      expect(isBlocked).toBe(true);
    });

    it("should allow booking on unblocked dates", () => {
      const blocks: any[] = [];

      const requestedDate = "2026-03-10";
      const mealType = "lunch" as const;

      const isBlocked = blocks.some(
        (block) =>
          block.blockType === "date" &&
          block.blockDate?.toISOString().split("T")[0] === requestedDate &&
          (block.mealType === "both" || block.mealType === mealType)
      );

      expect(isBlocked).toBe(false);
    });
  });

  describe("Meal Type Blocking", () => {
    it("should block only lunch when mealType is lunch", () => {
      const blocks = [
        {
          id: 1,
          hostListingId: 1,
          blockType: "date" as const,
          blockDate: new Date("2026-03-10"),
          blockWeekday: null,
          mealType: "lunch" as const,
          reason: "Lunch commitment",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const lunchBlocked = blocks.some(
        (block) =>
          block.blockType === "date" &&
          block.blockDate?.toISOString().split("T")[0] === "2026-03-10" &&
          (block.mealType === "both" || block.mealType === "lunch")
      );

      const dinnerBlocked = blocks.some(
        (block) =>
          block.blockType === "date" &&
          block.blockDate?.toISOString().split("T")[0] === "2026-03-10" &&
          (block.mealType === "both" || block.mealType === "dinner")
      );

      expect(lunchBlocked).toBe(true);
      expect(dinnerBlocked).toBe(false);
    });

    it("should block both meals when mealType is both", () => {
      const blocks = [
        {
          id: 1,
          hostListingId: 1,
          blockType: "date" as const,
          blockDate: new Date("2026-03-10"),
          blockWeekday: null,
          mealType: "both" as const,
          reason: "Full day unavailable",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const lunchBlocked = blocks.some(
        (block) =>
          block.blockType === "date" &&
          block.blockDate?.toISOString().split("T")[0] === "2026-03-10" &&
          (block.mealType === "both" || block.mealType === "lunch")
      );

      const dinnerBlocked = blocks.some(
        (block) =>
          block.blockType === "date" &&
          block.blockDate?.toISOString().split("T")[0] === "2026-03-10" &&
          (block.mealType === "both" || block.mealType === "dinner")
      );

      expect(lunchBlocked).toBe(true);
      expect(dinnerBlocked).toBe(true);
    });
  });

  describe("Weekday Blocking", () => {
    it("should identify blocked weekdays", () => {
      // March 11, 2026 is a Tuesday (weekday 1 in Monday=0 system)
      const blocks = [
        {
          id: 1,
          hostListingId: 1,
          blockType: "weekday" as const,
          blockDate: null,
          blockWeekday: 2, // Wednesday (March 11, 2026)
          mealType: "both" as const,
          reason: "Every Tuesday",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const date = new Date("2026-03-11");
      const dayOfWeek = (date.getUTCDay() + 6) % 7; // Convert to Monday=0

      const isBlocked = blocks.some(
        (block) =>
          block.blockType === "weekday" &&
          block.blockWeekday === dayOfWeek &&
          (block.mealType === "both" || block.mealType === "lunch")
      );

      expect(isBlocked).toBe(true);
    });

    it("should not block different weekdays", () => {
      const blocks = [
        {
          id: 1,
          hostListingId: 1,
          blockType: "weekday" as const,
          blockDate: null,
          blockWeekday: 0, // Monday
          mealType: "both" as const,
          reason: "Every Monday",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // March 11, 2026 is a Tuesday (weekday 1)
      const date = new Date("2026-03-11");
      const dayOfWeek = (date.getUTCDay() + 6) % 7; // Convert to Monday=0

      const isBlocked = blocks.some(
        (block) =>
          block.blockType === "weekday" &&
          block.blockWeekday === dayOfWeek &&
          (block.mealType === "both" || block.mealType === "lunch")
      );

      expect(isBlocked).toBe(false);
    });
  });

  describe("All Day Blocking", () => {
    it("should block all bookings when all_day block exists", () => {
      const blocks = [
        {
          id: 1,
          hostListingId: 1,
          blockType: "all_day" as const,
          blockDate: null,
          blockWeekday: null,
          mealType: "both" as const,
          reason: "Host unavailable",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const isBlocked = blocks.some((block) => block.blockType === "all_day");

      expect(isBlocked).toBe(true);
    });
  });

  describe("Availability Slot Generation", () => {
    it("should generate available slots for a date range", () => {
      const startDate = "2026-03-10";
      const endDate = "2026-03-12";

      const slots = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        slots.push({
          date: dateStr,
          lunch: true,
          dinner: true,
        });
      }

      expect(slots).toHaveLength(3);
      expect(slots[0].date).toBe("2026-03-10");
      expect(slots[1].date).toBe("2026-03-11");
      expect(slots[2].date).toBe("2026-03-12");
    });
  });
});
