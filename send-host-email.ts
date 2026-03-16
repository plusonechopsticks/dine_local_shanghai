// Script to manually send host notification email for existing paid booking
import { getDb } from "./server/db";
import { bookings, hostListings } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import { generateHostNotificationEmail } from "./server/email-templates";
import { sendEmail } from "./server/email";

async function sendHostNotificationForBooking(bookingId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Fetch booking with host details
    const bookingResult = await db
      .select()
      .from(bookings)
      .leftJoin(hostListings, eq(bookings.hostListingId, hostListings.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    const bookingWithHost = bookingResult[0]
      ? {
          ...bookingResult[0].bookings,
          hostListing: bookingResult[0].host_listings,
        }
      : null;

    if (!bookingWithHost || !bookingWithHost.hostListing) {
      throw new Error(`Booking ${bookingId} not found or missing host details`);
    }

    if (bookingWithHost.paymentStatus !== "paid") {
      throw new Error(
        `Booking ${bookingId} is not paid (status: ${bookingWithHost.paymentStatus})`
      );
    }

    console.log("Booking details:", {
      id: bookingWithHost.id,
      guest: bookingWithHost.guestName,
      host: bookingWithHost.hostListing.hostName,
      hostEmail: bookingWithHost.hostListing.email,
      date: bookingWithHost.requestedDate,
      amount: bookingWithHost.totalAmount,
    });

    const totalAmount = parseFloat(bookingWithHost.totalAmount!);
    const hostEarnings = totalAmount * 0.7; // 70% to host

    const hostEmailHtml = generateHostNotificationEmail({
      bookingId: bookingWithHost.id,
      guestName: bookingWithHost.guestName,
      guestEmail: bookingWithHost.guestEmail,
      guestPhone: bookingWithHost.guestPhone,
      requestedDate: bookingWithHost.requestedDate.toISOString(),
      mealType: bookingWithHost.mealType,
      numberOfGuests: bookingWithHost.numberOfGuests,
      totalAmount: totalAmount,
      dietaryRestrictions: bookingWithHost.specialRequests,
      hostName: bookingWithHost.hostListing.hostName,
      hostEarnings: hostEarnings,
    });

    const subject = `🎉 New Confirmed Booking - ${new Date(
      bookingWithHost.requestedDate
    ).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })} ${
      bookingWithHost.mealType.charAt(0).toUpperCase() +
      bookingWithHost.mealType.slice(1)
    }`;

    await sendEmail({
      to: bookingWithHost.hostListing.email,
      subject: subject,
      html: hostEmailHtml,
    });

    console.log(
      `✅ Successfully sent host notification email to ${bookingWithHost.hostListing.email}`
    );
    console.log(`Subject: ${subject}`);
  } catch (error: any) {
    console.error("❌ Error sending host notification email:", error);
    throw error;
  }
}

// Get booking ID from command line argument
const bookingId = process.argv[2] ? parseInt(process.argv[2]) : 360001;

console.log(`Sending host notification email for booking #${bookingId}...`);
sendHostNotificationForBooking(bookingId)
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error.message);
    process.exit(1);
  });
