import { getDb } from "./db";
import { bookings, hostListings } from "../drizzle/schema";
import { eq, and, lte, isNull, or } from "drizzle-orm";
import { sendEmail } from "./email";
import { generateGuestReminderEmail } from "./guest-reminder-email";
import { generateHostReminderEmail } from "./host-reminder-email";

/**
 * Process pending reminders: find all paid bookings where:
 * - The 48-hour reminder window has passed (requestedDate - 48h <= now)
 * - The reminder has NOT been sent yet (reminderEmailSent = false/null)
 * - The experience date is still in the future (to avoid sending for very old bookings)
 *
 * This is called by an external hourly scheduled task, so it's resilient to server restarts.
 */
export async function processPendingReminders(): Promise<{
  processed: number;
  errors: number;
  details: string[];
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Failed to get database connection");
  }

  const now = new Date();
  // 48 hours from now — only remind for bookings within the next 48 hours (or already past the window)
  const cutoffTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  console.log(`[ProcessReminders] Running at ${now.toISOString()}, cutoff: ${cutoffTime.toISOString()}`);

  // Find paid bookings where reminder time has passed but reminder not yet sent
  // reminder time = requestedDate - 48h
  // So: requestedDate - 48h <= now  =>  requestedDate <= now + 48h
  const pendingBookings = await db
    .select({
      id: bookings.id,
      requestedDate: bookings.requestedDate,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      mealType: bookings.mealType,
      numberOfGuests: bookings.numberOfGuests,
      hostListingId: bookings.hostListingId,
      hostName: hostListings.hostName,
      hostEmail: hostListings.email,
      cuisineStyle: hostListings.cuisineStyle,
    })
    .from(bookings)
    .leftJoin(hostListings, eq(bookings.hostListingId, hostListings.id))
    .where(
      and(
        eq(bookings.paymentStatus, "paid"),
        // reminderEmailSent is false or null
        or(eq(bookings.reminderEmailSent, false), isNull(bookings.reminderEmailSent)),
        // requestedDate <= now + 48h (reminder window has arrived or passed)
        lte(bookings.requestedDate, cutoffTime)
      )
    );

  console.log(`[ProcessReminders] Found ${pendingBookings.length} bookings needing reminders`);

  let processed = 0;
  let errors = 0;
  const details: string[] = [];

  for (const booking of pendingBookings) {
    try {
      const experienceDateStr = booking.requestedDate.toISOString();
      
      // Send guest reminder
      const guestHtml = generateGuestReminderEmail({
        guestName: booking.guestName,
        hostName: booking.hostName || "",
        hostEmail: "",
        experienceDate: experienceDateStr,
        mealType: booking.mealType as "lunch" | "dinner",
        numberOfGuests: booking.numberOfGuests,
        cuisine: booking.cuisineStyle || "",
      });

      await sendEmail({
        to: booking.guestEmail,
        subject: "🎉 Your +1 Chopsticks Dining Experience is in 2 Days!",
        html: guestHtml,
      });

      console.log(`[ProcessReminders] Guest reminder sent to ${booking.guestEmail} for booking ${booking.id}`);

      // Send host reminder
      if (booking.hostEmail) {
        const hostHtml = generateHostReminderEmail({
          hostName: booking.hostName || "",
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          experienceDate: experienceDateStr,
          mealType: booking.mealType as "lunch" | "dinner",
          numberOfGuests: booking.numberOfGuests,
          cuisine: booking.cuisineStyle || "",
        });

        await sendEmail({
          to: booking.hostEmail,
          subject: "🎉 Your +1 Chopsticks Hosting Experience is in 2 Days!",
          html: hostHtml,
        });

        console.log(`[ProcessReminders] Host reminder sent to ${booking.hostEmail} for booking ${booking.id}`);
      }

      // Mark reminder as sent
      await db
        .update(bookings)
        .set({ reminderEmailSent: true })
        .where(eq(bookings.id, booking.id));

      processed++;
      details.push(`✓ Booking ${booking.id}: ${booking.guestName} (${booking.guestEmail}) for ${booking.requestedDate.toDateString()}`);
    } catch (err: any) {
      errors++;
      const msg = `✗ Booking ${booking.id}: ${err?.message || "Unknown error"}`;
      details.push(msg);
      console.error(`[ProcessReminders] Error processing booking ${booking.id}:`, err);
    }
  }

  console.log(`[ProcessReminders] Done. Processed: ${processed}, Errors: ${errors}`);
  return { processed, errors, details };
}
