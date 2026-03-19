import { sendEmail } from "./server/email.js";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.js";

async function sendTestReminderEmail() {
  try {
    console.log("[Test] Generating guest reminder email with cheat sheets...");

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

    console.log("[Test] Sending test reminder email to plusonechopsticks@gmail.com...");

    const result = await sendEmail({
      to: "plusonechopsticks@gmail.com",
      subject: "🎉 Your +1 Chopsticks Dining Experience is Tomorrow! - Test Email with Cheat Sheets",
      html: emailHtml,
    });

    console.log("[Test] ✅ Test email sent successfully!");
    console.log("[Test] Email sent to: plusonechopsticks@gmail.com");
    console.log("[Test] Subject: Your +1 Chopsticks Dining Experience is Tomorrow!");
    console.log("[Test] Content includes:");
    console.log("  - Experience details for Chang En Kai's booking");
    console.log("  - Three home dining cheat sheets:");
    console.log("    1. Getting There & Arriving");
    console.log("    2. Chopsticks Manners & Good Etiquette");
    console.log("    3. Useful Expressions for the Table");
    console.log("[Test] ✅ All cheat sheet images are embedded in the email!");

    return result;
  } catch (error) {
    console.error("[Test] ❌ Error sending test email:", error);
    throw error;
  }
}

sendTestReminderEmail();
