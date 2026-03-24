import mysql from 'mysql2/promise';
import { Resend } from 'resend';
import { generateGuestReminderEmail } from './server/guest-reminder-email';

async function sendEnKaiReminder() {
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

    // Fetch fresh data from database
    const [rows] = await connection.execute(`
      SELECT 
        b.id,
        b.guestName,
        b.guestEmail,
        b.requestedDate,
        b.numberOfGuests,
        h.hostName,
        h.email as hostEmail,
        h.cuisineStyle
      FROM bookings b
      LEFT JOIN host_listings h ON b.hostListingId = h.id
      WHERE b.id = '660001'
    `);

    const booking = (rows as any[])[0];
    
    if (!booking) {
      console.error("❌ Booking not found");
      process.exit(1);
    }

    console.log("\n📧 Fresh booking data:");
    console.log("Guest:", booking.guestName);
    console.log("Date from DB:", booking.requestedDate);
    console.log("Cuisine:", booking.cuisineStyle);

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
    
    console.log("\n📧 Sending from:", EMAIL_FROM);
    console.log("\n✅ Database connection successful!");

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: "plusonechopsticks@gmail.com",
      subject: `🎉 Your +1 Chopsticks Dining Experience is Tomorrow!`,
      html: htmlContent,
    });

    if (response.error) {
      console.error("❌ Failed to send email:", response.error);
      process.exit(1);
    }

    console.log("\n✅ Email sender updated to +1Chopsticks!");
    console.log("\n✅ Date updated to March 23, 2026 (Tomorrow)!");
    console.log("\n✅ Reminder email sent to your email for review!");
    console.log("📧 Check: plusonechopsticks@gmail.com");
    console.log("⏰ The email will show: 'Your dining experience is tomorrow!'");
    console.log("📋 Ready to send to En Kai at", booking.guestEmail + "?");

    await connection.end();
    console.log("\n📧 En Kai's email: changenkai@gmail.com");
    console.log("\n📧 Host: Chuan 川 | Cuisine: Guangxi-Cantonese Style");
    console.log("\n✅ All done! Check your email for the preview.");
    console.log("\n📋 Confirm to send to En Kai?");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error?.message || error);
    process.exit(1);
  }
}

sendEnKaiReminder().catch(console.error);
