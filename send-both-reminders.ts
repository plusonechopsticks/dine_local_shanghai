import mysql from 'mysql2/promise';
import { Resend } from 'resend';
import { generateGuestReminderEmail } from './server/guest-reminder-email';
import { generateHostReminderEmail } from './server/host-reminder-email';

async function sendBothReminders() {
  try {
    // Parse DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root@localhost/dine_local_shanghai');
    
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });

    // Fetch booking and host data
    const [rows] = await connection.execute(`
      SELECT 
        b.id,
        b.guestName,
        b.guestEmail,
        b.requestedDate,
        b.mealType,
        b.numberOfGuests,
        h.hostName,
        h.email as hostEmail,
        h.cuisineStyle
      FROM bookings b
      JOIN host_listings h ON b.hostListingId = h.id
      WHERE b.id = 660001
    `) as any;

    if (!rows || rows.length === 0) {
      console.error("❌ Booking not found");
      process.exit(1);
    }

    const booking = rows[0];

    console.log("\n📧 Booking data:");
    console.log("Guest:", booking.guestName);
    console.log("Host:", booking.hostName);
    console.log("Date:", booking.requestedDate);
    console.log("Host Email:", booking.hostEmail);

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

    console.log("\n📧 Sending from:", EMAIL_FROM);

    // Generate guest reminder
    const guestHtmlContent = generateGuestReminderEmail({
      guestName: booking.guestName || "Guest",
      hostName: booking.hostName,
      hostEmail: booking.hostEmail,
      experienceDate: booking.requestedDate.toISOString(),
      mealType: booking.mealType,
      numberOfGuests: booking.numberOfGuests,
      cuisine: booking.cuisineStyle,
    });

    // Send guest reminder
    console.log("\n📧 Sending GUEST reminder to:", booking.guestEmail);
    const guestResponse = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.guestEmail,
      subject: "🎉 Your +1 Chopsticks Dining Experience is Tomorrow!",
      html: guestHtmlContent,
    });

    if (guestResponse.error) {
      console.error("❌ Failed to send guest email:", guestResponse.error);
      process.exit(1);
    }

    console.log("✅ Guest reminder sent successfully!");

    // Generate host reminder
    const hostHtmlContent = generateHostReminderEmail({
      hostName: booking.hostName,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      experienceDate: booking.requestedDate.toISOString(),
      mealType: booking.mealType,
      numberOfGuests: booking.numberOfGuests,
      cuisine: booking.cuisineStyle,
    });

    // Send host reminder
    console.log("\n📧 Sending HOST reminder to:", booking.hostEmail);
    const hostResponse = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.hostEmail,
      subject: "🎉 Your +1 Chopsticks Hosting Experience is Tomorrow!",
      html: hostHtmlContent,
    });

    if (hostResponse.error) {
      console.error("❌ Failed to send host email:", hostResponse.error);
      process.exit(1);
    }

    console.log("✅ Host reminder sent successfully!");

    await connection.end();
    
    console.log("\n✅ Both reminders sent successfully!");
    console.log("📧 Guest:", booking.guestEmail);
    console.log("📧 Host:", booking.hostEmail);
    console.log("\n🎉 Email reminder system is now live!");
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error?.message || error);
    process.exit(1);
  }
}

sendBothReminders().catch(console.error);
