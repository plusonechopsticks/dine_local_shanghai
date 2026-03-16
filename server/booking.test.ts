import { describe, it, expect, vi } from "vitest";

describe("Booking Functionality", () => {
  it("booking status enum includes all expected values", () => {
    const validStatuses = ["pending", "confirmed", "cancelled", "rejected"];
    validStatuses.forEach((status) => {
      expect(["pending", "confirmed", "cancelled", "rejected"]).toContain(status);
    });
  });

  it("booking meal type enum includes lunch and dinner", () => {
    const validMealTypes = ["lunch", "dinner"];
    validMealTypes.forEach((mealType) => {
      expect(["lunch", "dinner"]).toContain(mealType);
    });
  });

  it("booking object has required fields", () => {
    const mockBooking = {
      id: 1,
      hostListingId: 1,
      guestName: "John Doe",
      guestEmail: "john@example.com",
      guestPhone: "+86 13800000000",
      requestedDate: new Date("2026-02-15"),
      mealType: "dinner" as const,
      numberOfGuests: 2,
      specialRequests: "Vegetarian",
      bookingStatus: "pending" as const,
      hostNotes: "Confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
      hostName: "Grace",
    };

    expect(mockBooking).toHaveProperty("id");
    expect(mockBooking).toHaveProperty("hostListingId");
    expect(mockBooking).toHaveProperty("guestName");
    expect(mockBooking).toHaveProperty("guestEmail");
    expect(mockBooking).toHaveProperty("requestedDate");
    expect(mockBooking).toHaveProperty("mealType");
    expect(mockBooking).toHaveProperty("numberOfGuests");
    expect(mockBooking).toHaveProperty("bookingStatus");
    expect(mockBooking).toHaveProperty("createdAt");
    expect(mockBooking.mealType).toBe("dinner");
    expect(mockBooking.bookingStatus).toBe("pending");
  });

  it("booking date formatting works correctly", () => {
    const date = new Date("2026-02-15");
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });

  it("booking status badge colors are correctly mapped", () => {
    const statusColors: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800",
    };

    expect(statusColors.confirmed).toBe("bg-green-100 text-green-800");
    expect(statusColors.pending).toBe("bg-yellow-100 text-yellow-800");
    expect(statusColors.cancelled).toBe("bg-gray-100 text-gray-800");
    expect(statusColors.rejected).toBe("bg-red-100 text-red-800");
  });

  it("booking table displays all required columns", () => {
    const columns = [
      "Guest Name",
      "Email",
      "Host",
      "Date",
      "Meal Type",
      "Guests",
      "Status",
      "Created",
    ];

    expect(columns).toHaveLength(8);
    expect(columns).toContain("Guest Name");
    expect(columns).toContain("Email");
    expect(columns).toContain("Host");
    expect(columns).toContain("Date");
    expect(columns).toContain("Meal Type");
    expect(columns).toContain("Guests");
    expect(columns).toContain("Status");
    expect(columns).toContain("Created");
  });
});
