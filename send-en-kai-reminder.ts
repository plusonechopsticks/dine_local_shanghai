import { getDb } from "./server/db.ts";
import { bookings } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { sendEmail } from "./server/email.ts";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.ts";

async function sendEnKaiReminder() {
  try {
    console.log("[En Kai Reminder] Starting...");
    const db = await getDb();
    if (!db) {
      console.error("[En Kai Reminder] Failed to get database connection");
      return;
    }

    // Find En Kai's booking
    const enKaiBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.guestName, "Chang En Kai"));

    if (enKaiBookings.length === 0) {
      console.error("[En Kai Reminder] No booking found for Chang En Kai");
      return;
    }

    const booking = enKaiBookings[0];
    console.log(`[En Kai Reminder] Found booking ${booking.id} for ${booking.guestName}`);

    // Generate reminder email
    const htmlContent = generateGuestReminderEmail({
      guestName: booking.guestName,
      hostName: booking.hostName,
      hostEmail: "",
      experienceDate: booking.requestedDate.toISOString(),
      mealType: booking.mealType,
      numberOfGuests: booking.numberOfGuests,
      cuisine: booking.cuisine || "",
    });

    // Send to user's email (plusonechopsticks@gmail.com)
    const success = await sendEmail({
      to: "plusonechopsticks@gmail.com",
      subject: `En Kai's Reminder: +1 Chopsticks Home Dining Experience`,
      html: htmlContent,
    });

    if (success) {
      console.log(`[En Kai Reminder] Successfully sent reminder to plusonechopsticks@gmail.com`);
    } else {
      console.error(`[En Kai Reminder] Failed to send reminder`);
    }
  } catch (error) {
    console.error("[En Kai Reminder] Error:", error);
  }
}

sendEnKaiReminder().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
