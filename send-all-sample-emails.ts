import {
  sendGuestConfirmationEmail,
  sendPaymentReminderEmail,
  sendHostConfirmationEmail,
  sendGuestRejectionEmail,
} from "./server/email.ts";
import { generateGuestReminderEmail } from "./server/guest-reminder-email.ts";
import { sendEmail } from "./server/email.ts";

const userEmail = "plusonechopsticks@gmail.com";

async function sendAllSampleEmails() {
  console.log("[Sample Emails] Starting to send all auto-triggered email samples...\n");

  const bookingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const paymentDate = new Date();

  // 1. Guest Confirmation Email (after payment)
  console.log("[1/4] Sending Guest Confirmation Email...");
  await sendGuestConfirmationEmail({
    bookingId: 123456,
    guestName: "Sample Guest",
    guestEmail: userEmail,
    hostName: "Chuan 川",
    requestedDate: bookingDate,
    mealType: "dinner",
    numberOfGuests: 2,
    totalAmount: "¥400",
    paymentDate: paymentDate,
    stripeSessionId: "cs_test_sample123",
  });

  // 2. Payment Reminder Email
  console.log("[2/4] Sending Payment Reminder Email...");
  await sendPaymentReminderEmail({
    bookingId: 123457,
    guestName: "Sample Guest",
    guestEmail: userEmail,
    hostName: "Chuan 川",
    requestedDate: bookingDate,
    mealType: "dinner",
    numberOfGuests: 2,
    totalAmount: "¥400",
    paymentLink: "https://checkout.stripe.com/pay/sample",
  });

  // 3. Host Confirmation Email (when booking is confirmed)
  console.log("[3/4] Sending Host Confirmation Email...");
  await sendHostConfirmationEmail({
    bookingId: 123456,
    guestName: "Sample Guest",
    guestEmail: "guest@example.com",
    guestPhone: "+86 138 1234 5678",
    requestedDate: bookingDate,
    mealType: "dinner",
    numberOfGuests: 2,
    totalAmount: 400,
    dietaryRestrictions: "Vegetarian options appreciated",
    hostName: "Chuan 川",
    hostEmail: userEmail,
    hostEarnings: 280,
  });

  // 4. Guest Reminder Email
  console.log("[4/4] Sending Guest Reminder Email...");
  const reminderHtml = generateGuestReminderEmail({
    guestName: "Sample Guest",
    hostName: "Chuan 川",
    hostEmail: "host@example.com",
    experienceDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    mealType: "dinner",
    numberOfGuests: 2,
    cuisine: "Guangxi-Cantonese Style",
  });

  await sendEmail({
    to: userEmail,
    subject: "🎉 Your +1 Chopsticks Dining Experience is Tomorrow! - Sample Reminder",
    html: reminderHtml,
  });

  console.log("\n✅ All 4 sample emails sent successfully!");
  console.log("Check your email (plusonechopsticks@gmail.com) for all samples.");
}

sendAllSampleEmails()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
