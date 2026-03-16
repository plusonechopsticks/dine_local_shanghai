import schedule from "node-schedule";
import { getDb } from "./db";
import { bookings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";
import { generateGuestReminderEmail } from "./guest-reminder-email";

interface ScheduledReminder {
  bookingId: number;
  jobId: string;
}

// Keep track of scheduled reminders to avoid duplicates
const scheduledReminders = new Map<number, ScheduledReminder>();

/**
 * Schedule a guest reminder email to be sent 48 hours before the experience
 */
export async function scheduleGuestReminder(
  bookingId: number,
  experienceDate: Date,
  guestName: string,
  guestEmail: string,
  hostName: string,
  mealType: "lunch" | "dinner",
  numberOfGuests: number,
  cuisine: string
) {
  try {
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
        console.log(`[Reminder Scheduler] Sending reminder for booking ${bookingId}`);
        
        // Generate and send the reminder email
        const htmlContent = generateGuestReminderEmail({
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
          subject: "+1 Chopsticks Home Dining Experience Reminder",
          html: htmlContent,
        });
        
        console.log(`[Reminder Scheduler] Reminder email sent to ${guestEmail} for booking ${bookingId}`);
        
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
        console.error(`[Reminder Scheduler] Error sending reminder for booking ${bookingId}:`, error);
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
 * Cancel a scheduled reminder
 */
export function cancelGuestReminder(bookingId: number) {
  const reminder = scheduledReminders.get(bookingId);
  if (reminder) {
    schedule.cancelJob(reminder.jobId);
    scheduledReminders.delete(bookingId);
    console.log(`[Reminder Scheduler] Cancelled reminder for booking ${bookingId}`);
  }
}

/**
 * Get all scheduled reminders
 */
export function getScheduledReminders() {
  return Array.from(scheduledReminders.values());
}
