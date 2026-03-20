import { sendEmail } from "./server/email.js";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.js";

async function sendTeamSampleEmail() {
  try {
    console.log("[Team] Generating sample reminder email for team members...");

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

    const teamEmails = ["leaasunn@gmail.com", "dsun18@gmail.com"];

    console.log("[Team] Sending sample reminder email to team members...");

    for (const email of teamEmails) {
      await sendEmail({
        to: email,
        subject: "Home Dining Cheat Sheets to your +1 Chopsticks Experience (Sample Email)",
        html: emailHtml,
      });
      console.log(`[Team] ✅ Email sent to ${email}`);
    }

    console.log("[Team] ✅ All team sample emails sent successfully!");
    console.log("[Team] Recipients:");
    console.log("  - leaasunn@gmail.com");
    console.log("  - dsun18@gmail.com");
    console.log("[Team] Content includes:");
    console.log("  - Experience details for Chang En Kai's booking");
    console.log("  - Host email mentioned in body");
    console.log("  - All three home dining cheat sheets");
    console.log("[Team] ✅ Thank you for helping with the project!");

    return true;
  } catch (error) {
    console.error("[Team] ❌ Error sending team emails:", error);
    throw error;
  }
}

sendTeamSampleEmail();
