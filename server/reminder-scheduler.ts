import schedule from "node-schedule";
import { getDb } from "./db";
import { bookings, hostListings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";
import { generateGuestReminderEmail } from "./guest-reminder-email";
import { generateHostReminderEmail } from "./host-reminder-email";

interface ScheduledReminder {
  bookingId: number;
  jobId: string;
}

// Keep track of scheduled reminders to avoid duplicates
const scheduledReminders = new Map<number, ScheduledReminder>();

/**
 * Schedule a guest reminder email to be sent 48 hours before the experience
 * Only schedules reminders for PAID bookings
 */
export async function scheduleGuestReminder(
  bookingId: number,
  experienceDate: Date,
  guestName: string,
  guestEmail: string,
  hostName: string,
  mealType: "lunch" | "dinner",
  numberOfGuests: number,
  cuisine: string,
  paymentStatus: string = "pending"
) {
  try {
    // Only schedule reminders for PAID bookings
    if (paymentStatus !== "paid") {
      console.log(`[Reminder Scheduler] Booking ${bookingId} is not paid (status: ${paymentStatus}), skipping reminder schedule`);
      return;
    }
    
    // Calculate 48 hours before the experience
    const reminderTime = new Date(experienceDate.getTime() - 48 * 60 * 60 * 1000);
    
    // Don't schedule if the reminder time is in the past
    if (reminderTime < new Date()) {
      console.log(`[Reminder Scheduler] Reminder time is in the past for booking ${bookingId}, skipping schedule`);
      return;
    }
    
    // Create a unique job ID
    const jobId = `reminder-${bookingId}-${Date.now()}`;
    
    // Schedule the job
    const job = schedule.scheduleJob(jobId, reminderTime, async () => {
      try {
        console.log(`[Reminder Scheduler] Sending reminders for booking ${bookingId}`);
        
        // Generate and send the GUEST reminder email
        const guestHtmlContent = generateGuestReminderEmail({
          guestName,
          hostName,
          hostEmail: "", // Not needed for guest email
          experienceDate: experienceDate.toISOString(),
          mealType,
          numberOfGuests,
          cuisine,
        });
        
        await sendEmail({
          to: guestEmail,
          subject: "🎉 Your +1 Chopsticks Dining Experience is in 2 Days!",
          html: guestHtmlContent,
        });
        
        console.log(`[Reminder Scheduler] Guest reminder email sent to ${guestEmail} for booking ${bookingId}`);
        
        // Fetch host information and send HOST reminder email
        try {
          const db = await getDb();
          if (db) {
            // Get the booking with host listing info
            const bookingData = await db
              .select()
              .from(bookings)
              .where(eq(bookings.id, bookingId));
            
            if (bookingData.length > 0) {
              const booking = bookingData[0];
              
              // Get host listing
              const hostData = await db
                .select()
                .from(hostListings)
                .where(eq(hostListings.id, booking.hostListingId));
              
              if (hostData.length > 0) {
                const host = hostData[0];
                
                // Generate and send host reminder
                const hostHtmlContent = generateHostReminderEmail({
                  hostName: host.hostName,
                  guestName: booking.guestName,
                  guestEmail: booking.guestEmail,
                  experienceDate: experienceDate.toISOString(),
                  mealType: booking.mealType as "lunch" | "dinner",
                  numberOfGuests: booking.numberOfGuests,
                  cuisine: host.cuisineStyle,
                });
                
                await sendEmail({
                  to: host.email,
                  subject: "🎉 Your +1 Chopsticks Hosting Experience is in 2 Days!",
                  html: hostHtmlContent,
                });
                
                console.log(`[Reminder Scheduler] Host reminder email sent to ${host.email} for booking ${bookingId}`);
              }
            }
          }
        } catch (hostError) {
          console.error(`[Reminder Scheduler] Error sending host reminder for booking ${bookingId}:`, hostError);
          // Continue even if host email fails
        }
        
        // Mark reminder as sent in database
        const db = await getDb();
        if (db) {
          await db.update(bookings)
            .set({ reminderEmailSent: true })
            .where(eq(bookings.id, bookingId));
        }
        
        // Remove from scheduled reminders
        scheduledReminders.delete(bookingId);
      } catch (error) {
        console.error(`[Reminder Scheduler] Error sending reminders for booking ${bookingId}:`, error);
      }
    });
    
    // Store the scheduled reminder
    scheduledReminders.set(bookingId, { bookingId, jobId });
    
    console.log(`[Reminder Scheduler] Scheduled reminder for booking ${bookingId} at ${reminderTime.toISOString()}`);
  } catch (error) {
    console.error(`[Reminder Scheduler] Error scheduling reminder for booking ${bookingId}:`, error);
  }
}

/**
 * Cancel a scheduled reminder (both guest and host)
 */
export function cancelGuestReminder(bookingId: number) {
  const reminder = scheduledReminders.get(bookingId);
  if (reminder) {
    schedule.cancelJob(reminder.jobId);
    scheduledReminders.delete(bookingId);
    console.log(`[Reminder Scheduler] Cancelled reminders (guest + host) for booking ${bookingId}`);
  }
}

/**
 * Get all scheduled reminders
 */
export function getScheduledReminders() {
  return Array.from(scheduledReminders.values());
}

/**
 * Initialize reminders for existing paid bookings on server startup
 * This reschedules reminders for paid bookings that haven't had reminders sent yet
 */
export async function initializeExistingReminders() {
  try {
    console.log("[Reminder Scheduler] Initializing reminders for existing paid bookings...");
    const db = await getDb();
    if (!db) {
      console.error("[Reminder Scheduler] Failed to get database connection");
      return;
    }

    // Get all paid bookings that haven't had reminders sent, joined with host info
    const paidBookings = await db
      .select({
        id: bookings.id,
        requestedDate: bookings.requestedDate,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        mealType: bookings.mealType,
        numberOfGuests: bookings.numberOfGuests,
        paymentStatus: bookings.paymentStatus,
        reminderEmailSent: bookings.reminderEmailSent,
        hostName: hostListings.hostName,
        cuisineStyle: hostListings.cuisineStyle,
      })
      .from(bookings)
      .leftJoin(hostListings, eq(bookings.hostListingId, hostListings.id))
      .where(eq(bookings.paymentStatus, "paid"));

    console.log(`[Reminder Scheduler] Found ${paidBookings.length} paid bookings`);

    let scheduledCount = 0;
    for (const booking of paidBookings) {
      // Skip if reminder already sent
      if (booking.reminderEmailSent) {
        continue;
      }

      // Calculate when reminder should be sent (48 hours before experience)
      const reminderTime = new Date(booking.requestedDate.getTime() - 48 * 60 * 60 * 1000);
      const now = new Date();

      // Only schedule if reminder time is in the future
      if (reminderTime > now) {
        console.log(`[Reminder Scheduler] Scheduling reminders (guest + host) for booking ${booking.id}`);
        await scheduleGuestReminder(
          booking.id,
          booking.requestedDate,
          booking.guestName,
          booking.guestEmail,
          booking.hostName || "", // real host name from join
          booking.mealType as "lunch" | "dinner",
          booking.numberOfGuests,
          booking.cuisineStyle || "", // real cuisine from join
          booking.paymentStatus
        );
        scheduledCount++;
      } else {
        console.log(`[Reminder Scheduler] Reminder time is in the past for booking ${booking.id}, skipping`);
      }
    }

    console.log(`[Reminder Scheduler] Successfully initialized ${scheduledCount} reminder pairs (guest + host emails)`);
  } catch (error) {
    console.error("[Reminder Scheduler] Error initializing existing reminders:", error);
  }
}
