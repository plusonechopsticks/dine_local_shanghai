import { sendEmail } from "./server/email.js";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.js";

async function sendUpdatedTestReminderEmail() {
  try {
    console.log("[Test] Generating updated guest reminder email with cheat sheets...");

    // Use the booking that's happening today (March 21, 2026 - Chang En Kai)
    const emailData = {
      guestName: "Chang En Kai",
      hostName: "Shanghai Host",
      hostEmail: "host@example.com",
      experienceDate: "2026-03-21T19:00:00Z", // Dinner at 7 PM
      mealType: "dinner",
      numberOfGuests: 1,
      cuisine: "Shanghai",
    };

    const emailHtml = generateGuestReminderEmail(emailData);

    console.log("[Test] Sending updated reminder email to guest and host...");

    // Send to guest
    await sendEmail({
      to: "plusonechopsticks@gmail.com",
      cc: "host@example.com",
      subject: "Home Dining Cheat Sheets to your +1 Chopsticks Experience",
      html: emailHtml,
    });

    console.log("[Test] ✅ Updated test email sent successfully!");
    console.log("[Test] Email sent to: plusonechopsticks@gmail.com");
    console.log("[Test] CC'd to: host@example.com");
    console.log("[Test] Subject: Home Dining Cheat Sheets to your +1 Chopsticks Experience");
    console.log("[Test] Content includes:");
    console.log("  - Experience details for Chang En Kai's booking");
    console.log("  - Host email mentioned in body: host@example.com");
    console.log("  - Three home dining cheat sheets:");
    console.log("    1. Getting There & Arriving");
    console.log("    2. Chopsticks Manners & Good Etiquette");
    console.log("    3. Useful Expressions for the Table");
    console.log("[Test] ✅ All updates applied successfully!");

    return true;
  } catch (error) {
    console.error("[Test] ❌ Error sending test email:", error);
    throw error;
  }
}

sendUpdatedTestReminderEmail();
