import { getDb } from "./server/db.ts";
import { bookings } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.ts";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect");
    process.exit(1);
  }

  // Find booking 660001 (En Kai)
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, 660001))
    .limit(1);

  if (booking.length === 0) {
    console.log("Booking not found");
    process.exit(1);
  }

  const b = booking[0];
  console.log("Booking found:");
  console.log(`  ID: ${b.id}`);
  console.log(`  Guest: ${b.guestName}`);
  console.log(`  Host: ${b.hostName}`);
  console.log(`  Date: ${b.experienceDate}`);
  console.log(`  Cuisine: ${b.cuisine}`);
  console.log(`  Guests: ${b.numberOfGuests}`);
  console.log(`  Host Email: ${b.hostEmail}`);

  // Generate email
  const html = generateGuestReminderEmail({
    guestName: b.guestName || "Guest",
    hostName: b.hostName || "Host",
    hostEmail: b.hostEmail || "host@example.com",
    experienceDate: b.experienceDate ? new Date(b.experienceDate).toISOString() : new Date().toISOString(),
    mealType: b.mealType as "lunch" | "dinner",
    numberOfGuests: b.numberOfGuests || 1,
    cuisine: b.cuisine || "Shanghai",
  });

  // Check for content
  console.log("\n=== EMAIL CONTENT CHECK ===");
  console.log("Contains 'Experience Details':", html.includes("Experience Details"));
  console.log("Contains host name:", html.includes(b.hostName || "Host"));
  console.log("Contains date:", html.includes("March") || html.includes("2026"));
  console.log("Contains cuisine:", html.includes(b.cuisine || "Shanghai"));
  console.log("Contains cheat sheet images:", html.includes("gJvoPIaYkJzcUXed.PNG"));
  console.log("Contains image 1:", html.includes("gJvoPIaYkJzcUXed.PNG"));
  console.log("Contains image 2:", html.includes("YRUHjnBjIrOsYeTy.PNG"));
  console.log("Contains image 3:", html.includes("fOeqwqkOExiaqFWf.PNG"));

  // Save email to file for inspection
  const fs = await import("fs");
  fs.writeFileSync("/tmp/test-email.html", html);
  console.log("\nEmail saved to /tmp/test-email.html");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
