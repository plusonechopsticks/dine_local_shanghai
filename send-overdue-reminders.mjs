import { getDb } from "./server/db.ts";
import { bookings } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { sendEmail } from "./server/email.ts";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.ts";

async function sendOverdueReminders() {
  try {
    console.log("[Overdue Reminders] Starting...");
    const db = await getDb();
    if (!db) {
      console.error("[Overdue Reminders] Failed to get database connection");
      return;
    }

    // Get all paid bookings that haven't had reminders sent
    const paidBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.paymentStatus, "paid"));

    console.log(`[Overdue Reminders] Found ${paidBookings.length} paid bookings`);

    let sentCount = 0;
    for (const booking of paidBookings) {
      // Skip if reminder already sent
      if (booking.reminderEmailSent) {
        console.log(`[Overdue Reminders] Booking ${booking.id} already has reminder sent, skipping`);
        continue;
      }

      // Check if experience date is in the future
      const experienceDate = new Date(booking.requestedDate);
      const now = new Date();
      
      if (experienceDate > now) {
        console.log(`[Overdue Reminders] Booking ${booking.id} experience is in the future (${experienceDate.toISOString()}), skipping`);
        continue;
      }

      // Send reminder for past experiences (overdue)
      console.log(`[Overdue Reminders] Sending overdue reminder for booking ${booking.id}`);
      
      const htmlContent = generateGuestReminderEmail({
        guestName: booking.guestName,
        hostName: booking.hostName,
        hostEmail: "",
        experienceDate: booking.requestedDate.toISOString(),
        mealType: booking.mealType,
        numberOfGuests: booking.numberOfGuests,
        cuisine: booking.cuisine || "",
      });

      const success = await sendEmail({
        to: booking.guestEmail,
        subject: "+1 Chopsticks Home Dining Experience Reminder",
        html: htmlContent,
      });

      if (success) {
        // Mark reminder as sent
        await db.update(bookings)
          .set({ reminderEmailSent: true })
          .where(eq(bookings.id, booking.id));
        
        console.log(`[Overdue Reminders] Successfully sent reminder to ${booking.guestEmail} for booking ${booking.id}`);
        sentCount++;
      } else {
        console.error(`[Overdue Reminders] Failed to send reminder to ${booking.guestEmail} for booking ${booking.id}`);
      }
    }

    console.log(`[Overdue Reminders] Completed. Sent ${sentCount} overdue reminders.`);
  } catch (error) {
    console.error("[Overdue Reminders] Error:", error);
  }
}

sendOverdueReminders().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
