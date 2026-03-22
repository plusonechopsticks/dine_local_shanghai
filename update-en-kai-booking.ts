import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { Resend } from "resend";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.ts";

async function updateEnKaiBooking() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL not set");
      process.exit(1);
    }

    // Parse DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });

    // Update En Kai's booking to Mar 23 (tomorrow in Shanghai time)
    const mar23 = new Date("2026-03-23T00:00:00+08:00");
    const mar23Str = mar23.toISOString().split('T')[0];

    await connection.execute(
      "UPDATE bookings SET requestedDate = ?, updatedAt = NOW() WHERE id = ?",
      [mar23Str, "660001"]
    );

    console.log("✅ En Kai's booking updated to Mar 23!");
    console.log("📅 New date: March 23, 2026 (Tomorrow in Shanghai time)");

    // Fetch the updated booking with host info
    const [rows] = await connection.execute(`
      SELECT 
        b.id,
        b.guestName,
        b.guestEmail,
        b.hostListingId,
        b.requestedDate,
        b.numberOfGuests,
        h.hostName,
        h.email as hostEmail,
        h.cuisineStyle as cuisineType
      FROM bookings b
      LEFT JOIN host_listings h ON b.hostListingId = h.id
      WHERE b.id = '660001'
    `);

    const booking = (rows as any[])[0];
    
    if (!booking) {
      console.error("❌ Booking not found");
      process.exit(1);
    }

    console.log("\n📧 Preparing reminder email...");
    console.log("Guest:", booking.guestName);
    console.log("Host:", booking.hostName);
    console.log("Date:", booking.requestedDate);
    console.log("Cuisine:", booking.cuisineStyle);
    console.log("Party Size:", booking.numberOfGuests);

    // Generate the reminder email HTML
    const htmlContent = generateGuestReminderEmail({
      guestName: booking.guestName || "Guest",
      hostName: booking.hostName || "Host",
      hostEmail: booking.hostEmail || "",
      experienceDate: new Date(booking.requestedDate).toISOString(),
      mealType: "dinner",
      numberOfGuests: booking.numberOfGuests || 1,
      cuisine: booking.cuisineStyle || "Cuisine",
    });

    // Send reminder to your email first for review
    const resend = new Resend(process.env.RESEND_API_KEY);
    const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

    await resend.emails.send({
      from: EMAIL_FROM,
      to: "plusonechopsticks@gmail.com",
      subject: `🎉 Your +1 Chopsticks Dining Experience is Tomorrow! - Test Email with Cheat Sheets`,
      html: htmlContent,
    });

    console.log("\n✅ Reminder email sent to your email for review!");
    console.log("📧 Check: plusonechopsticks@gmail.com");
    console.log("\n⏰ The email will show: 'Your dining experience is tomorrow!'");
    console.log("\n✅ Email preview sent to: plusonechopsticks@gmail.com");
    console.log("📋 Ready to send to En Kai at", booking.guestEmail + "?");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateEnKaiBooking();
