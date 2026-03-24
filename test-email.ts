import { sendEmail } from "./server/email.ts";

async function main() {
  const result = await sendEmail({
    to: 'plusonechopsticks@gmail.com',
    subject: 'Test Email from +1 Chopsticks - Resend Integration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8B3A3A;">✅ Email System Test</h2>
        <p>Hi,</p>
        <p>This is a test email to verify that the Resend email system is working correctly with your verified domain <strong>plus1chopsticks.com</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">System Status</h3>
          <ul>
            <li>✅ Resend API: Connected</li>
            <li>✅ Domain: plus1chopsticks.com (verified)</li>
            <li>✅ Sender: foodie@plus1chopsticks.com</li>
            <li>✅ Email templates: Ready</li>
            <li>✅ Reminder scheduler: Active</li>
          </ul>
        </div>
        <p>The email system is now ready to send guest confirmations, reminders, and notifications.</p>
        <p>Best regards,<br>+1 Chopsticks Team</p>
      </div>
    `
  });
  console.log('Test email sent:', result);
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
