import { describe, it, expect } from "vitest";
import { generateGuestReminderEmail } from "./guest-reminder-email";

describe("Guest Reminder Email Template", () => {
  it("should generate a valid HTML email", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 2,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("+1 Chopsticks");
    expect(html).toContain("加一雙筷子");
  });

  it("should include guest name in the email", () => {
    const emailData = {
      guestName: "John Doe",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("John Doe");
  });

  it("should include host name in the email", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Maria Chen",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("Maria Chen");
  });

  it("should include experience details", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 3,
      cuisine: "Shanghainese",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("Experience Details");
    expect(html).toContain("Shanghainese");
    expect(html).toContain("3 guests");
  });

  it("should include dinner emoji for dinner meals", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("🍽️");
  });

  it("should include lunch emoji for lunch meals", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-22T12:00:00Z",
      mealType: "lunch" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("🍜");
  });

  it("should include all three cheat sheet images", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    // Check for cheat sheet section
    expect(html).toContain("Your Home Dining Cheat Sheets");
    expect(html).toContain("📚");

    // Check for all three cheat sheet images
    expect(html).toContain("gJvoPIaYkJzcUXed.PNG"); // Cheat Sheet 1: Getting There & Arriving
    expect(html).toContain("YRUHjnBjIrOsYeTy.PNG"); // Cheat Sheet 2: Chopsticks Manners
    expect(html).toContain("fOeqwqkOExiaqFWf.PNG"); // Cheat Sheet 3: Useful Expressions

    // Check for image alt texts
    expect(html).toContain("Getting There & Arriving");
    expect(html).toContain("Chopsticks Manners");
    expect(html).toContain("Useful Expressions");
  });

  it("should include pro tip about saving images", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("Pro tip");
    expect(html).toContain("Save these images to your phone");
  });

  it("should include cancellation policy information", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("Need to Cancel");
    expect(html).toContain("48 hours");
    expect(html).toContain("non-refundable");
  });

  it("should include contact information", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("foodie@plus1chopsticks.com");
  });

  it("should format date correctly", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    // Should contain the formatted date (Saturday, March 21, 2026)
    expect(html).toContain("March 21, 2026");
  });

  it("should include proper HTML structure", () => {
    const emailData = {
      guestName: "Test Guest",
      hostName: "Test Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z",
      mealType: "dinner" as const,
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const html = generateGuestReminderEmail(emailData);

    expect(html).toContain("</html>");
    expect(html).toContain("<table");
    expect(html).toContain("</table>");
    expect(html).toContain("<meta charset");
    expect(html).toContain("viewport");
  });
});
