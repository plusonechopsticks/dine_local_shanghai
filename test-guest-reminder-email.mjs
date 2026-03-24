import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "plusonechopsticks@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "test-password",
  },
});

// Guest reminder email template
function generateGuestReminderEmail(data) {
  const experienceDate = new Date(data.experienceDate);
  const formattedDate = experienceDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mealTime = data.mealType === 'lunch' ? '12:00 PM (Noon)' : '7:00 PM';
  const mealEmoji = data.mealType === 'lunch' ? '🍜' : '🍽️';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your +1 Chopsticks Experience is Tomorrow! - Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #7c2d12; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">+1 Chopsticks</h1>
              <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 18px;">加一雙筷子</p>
            </td>
          </tr>

          <!-- Excitement Icon -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="font-size: 48px;">🎉</div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Your Dining Experience is Tomorrow! ${mealEmoji}</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                Get ready for an unforgettable evening of authentic Shanghai home cooking with ${data.hostName}!
              </p>
            </td>
          </tr>

          <!-- Experience Details -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #7c2d12; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #7c2d12; font-size: 18px; font-weight: 600;">Experience Details</h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600; width: 40%;">Host:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.hostName}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Date:</td>
                    <td style="color: #1f2937; font-size: 14px;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Time:</td>
                    <td style="color: #1f2937; font-size: 14px;">${mealTime}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Cuisine:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.cuisine}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Party Size:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.numberOfGuests} ${data.numberOfGuests === 1 ? 'guest' : 'guests'}</td>
                  </tr>
                  ${data.hostAddress ? `
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Location:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.hostAddress}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>

          <!-- Host Contact Information -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Contact Your Host</h3>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or need to reschedule, reach out to ${data.hostName}:
              </p>
              <table width="100%" cellpadding="8" cellspacing="0">
                ${data.hostPhone ? `
                <tr>
                  <td style="color: #78716c; font-size: 14px; font-weight: 600; width: 30%;">Phone:</td>
                  <td style="color: #1f2937; font-size: 14px;"><a href="tel:${data.hostPhone}" style="color: #7c2d12; text-decoration: none;">${data.hostPhone}</a></td>
                </tr>
                ` : ''}
                ${data.hostWeChat ? `
                <tr>
                  <td style="color: #78716c; font-size: 14px; font-weight: 600;">WeChat:</td>
                  <td style="color: #1f2937; font-size: 14px;">${data.hostWeChat}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- What to Expect -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">What to Expect</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Arrive 5-10 minutes early to find parking and settle in</li>
                <li>Enjoy authentic home-cooked ${data.cuisine} dishes</li>
                <li>Share stories and connect with your host and fellow guests</li>
                <li>Experience genuine Shanghai hospitality</li>
                <li>Typical experience lasts 2-3 hours</li>
              </ul>
            </td>
          </tr>

          <!-- Cancellation Reminder -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 600;">Need to Cancel?</h3>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  Cancellations within 48 hours of your experience are non-refundable. If you need to cancel or reschedule, please contact your host or email <strong>plusonechopsticks@gmail.com</strong> immediately.
                </p>
              </div>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                We can't wait for you to experience authentic Shanghai home cooking!
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Warm regards,<br>
                The +1 Chopsticks Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 +1 Chopsticks | Authentic Shanghai Home Dining Experience
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Test data
const testData = {
  guestName: "John Smith",
  hostName: "Chuan",
  experienceDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
  mealType: "dinner",
  numberOfGuests: 2,
  cuisine: "Shanghainese",
  hostAddress: "Jing'an District, Shanghai",
  hostPhone: "+86 13426056438",
  hostWeChat: "Chuan_Host"
};

// Send test email
async function sendTestEmail() {
  try {
    const htmlContent = generateGuestReminderEmail(testData);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "plusonechopsticks@gmail.com",
      to: "plusonechopsticks@gmail.com",
      subject: `Reminder: Your +1 Chopsticks Experience with ${testData.hostName} Tomorrow!`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("To:", mailOptions.to);
    console.log("Subject:", mailOptions.subject);
  } catch (error) {
    console.error("❌ Failed to send test email:", error);
    process.exit(1);
  }
}

sendTestEmail();
