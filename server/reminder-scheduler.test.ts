import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scheduleGuestReminder, getScheduledReminders, cancelGuestReminder } from "./reminder-scheduler";

// Mock the schedule module
vi.mock("node-schedule", () => ({
  default: {
    scheduleJob: vi.fn((id: string, time: Date, callback: Function) => {
      // Don't call callback immediately - just return the job
      return { id };
    }),
    cancelJob: vi.fn(),
  },
}));

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock the email sending
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

// Mock the email template
vi.mock("./guest-reminder-email", () => ({
  generateGuestReminderEmail: vi.fn().mockReturnValue("<html>Test email</html>"),
}));

describe("Guest Reminder Scheduler - Payment Status Check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up scheduled reminders
    getScheduledReminders().forEach((reminder) => {
      cancelGuestReminder(reminder.bookingId);
    });
  });

  it("should NOT schedule a reminder for pending bookings", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3); // 3 days from now

    await scheduleGuestReminder(
      1,
      futureDate,
      "Test Guest",
      "guest@example.com",
      "Test Host",
      "dinner",
      2,
      "Chinese",
      "pending" // Payment status: PENDING
    );

    // Should not schedule anything
    const scheduled = getScheduledReminders();
    expect(scheduled).toHaveLength(0);
  });

  it("should NOT schedule a reminder for cancelled bookings", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    await scheduleGuestReminder(
      2,
      futureDate,
      "Test Guest",
      "guest@example.com",
      "Test Host",
      "lunch",
      1,
      "Shanghainese",
      "cancelled" // Payment status: CANCELLED
    );

    const scheduled = getScheduledReminders();
    expect(scheduled).toHaveLength(0);
  });

  it("should schedule a reminder for paid bookings", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    await scheduleGuestReminder(
      3,
      futureDate,
      "Test Guest",
      "guest@example.com",
      "Test Host",
      "dinner",
      2,
      "Chinese",
      "paid" // Payment status: PAID
    );

    // Should schedule the reminder
    const scheduled = getScheduledReminders();
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].bookingId).toBe(3);
  });

  it("should NOT schedule a reminder if the reminder time is in the past", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // 1 day ago

    await scheduleGuestReminder(
      4,
      pastDate,
      "Test Guest",
      "guest@example.com",
      "Test Host",
      "dinner",
      2,
      "Chinese",
      "paid"
    );

    // Should not schedule anything because reminder time is in the past
    const scheduled = getScheduledReminders();
    expect(scheduled).toHaveLength(0);
  });

  it("should default to pending status if not provided", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    await scheduleGuestReminder(
      5,
      futureDate,
      "Test Guest",
      "guest@example.com",
      "Test Host",
      "lunch",
      1,
      "Shanghainese"
      // No paymentStatus provided - should default to "pending"
    );

    // Should not schedule anything (defaults to pending)
    const scheduled = getScheduledReminders();
    expect(scheduled).toHaveLength(0);
  });

  it("should only schedule reminders for paid bookings", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    // Try to schedule with different payment statuses
    await scheduleGuestReminder(
      10,
      futureDate,
      "Guest 1",
      "guest1@example.com",
      "Host 1",
      "dinner",
      2,
      "Chinese",
      "paid"
    );

    await scheduleGuestReminder(
      11,
      futureDate,
      "Guest 2",
      "guest2@example.com",
      "Host 2",
      "lunch",
      1,
      "Shanghainese",
      "pending" // This should NOT be scheduled
    );

    await scheduleGuestReminder(
      12,
      futureDate,
      "Guest 3",
      "guest3@example.com",
      "Host 3",
      "dinner",
      3,
      "Fusion",
      "paid"
    );

    // Should only have scheduled reminders for paid bookings
    const scheduled = getScheduledReminders();
    const scheduledIds = new Set(scheduled.map((r) => r.bookingId));

    // Verify that pending booking was NOT scheduled
    expect(scheduledIds).not.toContain(11);

    // Verify that paid bookings were scheduled
    expect(scheduledIds).toContain(10);
    expect(scheduledIds).toContain(12);
  });
});
