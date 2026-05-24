/**
 * Scheduled job: send review request emails to guests the day after their confirmed dining date.
 * Called daily at 10:00 UTC (18:00 CST) by manus-heartbeat.
 *
 * Logic:
 *  - Find all confirmed bookings whose requestedDate = yesterday (Shanghai time)
 *  - Skip bookings that already have a review
 *  - Skip bookings where reviewEmailSent = true
 *  - Send the review email and mark reviewEmailSent = true
 */

import { getDb } from "./db";
import { bookings, reviews } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendEmail } from "./email";

export async function sendReviewEmails(dateOverride?: string): Promise<{ sent: number; skipped: number; errors: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Determine yesterday in Shanghai time (UTC+8)
  let yesterdayStr: string;
  if (dateOverride) {
    yesterdayStr = dateOverride;
  } else {
    const now = new Date();
    // Shift to CST (UTC+8)
    const cstNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const yesterday = new Date(cstNow);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterdayStr = yesterday.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  console.log(`[ReviewEmails] Looking for confirmed bookings on ${yesterdayStr}`);

  // Find confirmed bookings from yesterday that haven't had a review email sent
  const eligibleBookings = await db
    .select({
      id: bookings.id,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      requestedDate: bookings.requestedDate,
      mealType: bookings.mealType,
      numberOfGuests: bookings.numberOfGuests,
      reviewEmailSent: bookings.reviewEmailSent,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.bookingStatus, "confirmed"),
        sql`DATE(${bookings.requestedDate}) = ${yesterdayStr}`,
        eq(bookings.reviewEmailSent, false)
      )
    );

  console.log(`[ReviewEmails] Found ${eligibleBookings.length} eligible bookings`);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const booking of eligibleBookings) {
    try {
      // Check if already reviewed
      const existingReview = await db
        .select({ id: reviews.id })
        .from(reviews)
        .where(eq(reviews.bookingId, booking.id))
        .limit(1);

      if (existingReview.length > 0) {
        console.log(`[ReviewEmails] Booking ${booking.id} already has a review, skipping`);
        // Mark as sent anyway so we don't check again
        await db.update(bookings).set({ reviewEmailSent: true }).where(eq(bookings.id, booking.id));
        skipped++;
        continue;
      }

      const reviewUrl = `https://plus1chopsticks.com/review/${booking.id}`;
      const mealDate = typeof booking.requestedDate === "string"
        ? booking.requestedDate
        : (booking.requestedDate as Date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

      const mealLabel = booking.mealType === "lunch" ? "lunch" : "dinner";

      await sendEmail({
        to: booking.guestEmail,
        subject: "How was your dining experience? 🥢 Share your review",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; padding: 24px 0;">
              <img src="https://plus1chopsticks.com/logo.png" alt="+1 Chopsticks" style="height: 40px;" />
            </div>
            <h2 style="color: #c0392b; margin-bottom: 8px;">How was your ${mealLabel}?</h2>
            <p>Hi ${booking.guestName},</p>
            <p>We hope you had a wonderful time at your home dining experience on <strong>${mealDate}</strong>! 🍜</p>
            <p>Your feedback means the world to us — and to the host who cooked for you. It only takes 2 minutes.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${reviewUrl}"
                 style="background-color: #c0392b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
                ⭐ Leave a Review
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Your review will be published on the +1 Chopsticks website and helps future guests discover authentic Shanghai home dining.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              +1 Chopsticks &mdash; Authentic Home Dining in Shanghai<br/>
              <a href="https://plus1chopsticks.com" style="color: #c0392b;">plus1chopsticks.com</a>
            </p>
          </div>
        `,
      });

      // Mark as sent
      await db.update(bookings).set({ reviewEmailSent: true }).where(eq(bookings.id, booking.id));
      console.log(`[ReviewEmails] Sent review email to ${booking.guestEmail} for booking ${booking.id}`);
      sent++;
    } catch (err: any) {
      console.error(`[ReviewEmails] Error processing booking ${booking.id}:`, err);
      errors++;
    }
  }

  console.log(`[ReviewEmails] Done: sent=${sent}, skipped=${skipped}, errors=${errors}`);
  return { sent, skipped, errors };
}
