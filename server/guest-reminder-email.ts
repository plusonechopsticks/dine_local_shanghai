/**
 * Guest Reminder Email Template
 * Sent 48 hours before the dining experience
 */

interface GuestReminderData {
  guestName: string;
  hostName: string;
  hostEmail: string;
  experienceDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  cuisine: string;
}

export function generateGuestReminderEmail(data: GuestReminderData): string {
  const experienceDate = new Date(data.experienceDate);
  const formattedDate = experienceDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Determine meal time
  const mealTime = data.mealType === 'lunch' ? '12:00 PM (Noon)' : '7:00 PM';
  const mealEmoji = data.mealType === 'lunch' ? '🍜' : '🍽️';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your +1 Chopsticks Home Dining Experience Reminder</title>
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
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Hi ${data.guestName}! Your Dining Experience is in 2 Days! ${mealEmoji}</h2>
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
                </table>
              </div>
            </td>
          </tr>

          <!-- Host Communication Check -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Important: Check Your Email</h3>
                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  By now, ${data.hostName} should have communicated with you by email to share:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                  <li>Their home address and how to reach it</li>
                  <li>Instructions for arrival</li>
                  <li>Discussion of your dietary requirements</li>
                </ul>
                <p style="margin: 12px 0 0 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>If you haven't received this email, please contact us immediately at <a href="mailto:foodie@plus1chopsticks.com" style="color: #2563eb; text-decoration: underline;">foodie@plus1chopsticks.com</a></strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- What to Expect -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">What to Expect</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Arrive on time to settle in and meet your host</li>
                <li>Enjoy authentic home-cooked ${data.cuisine} dishes</li>
                <li>Share stories and connect with your host and fellow guests</li>
                <li>Experience genuine Shanghai hospitality</li>
                <li>Typical experience lasts 2-3 hours</li>
              </ul>
            </td>
          </tr>

          <!-- Home Dining Tips -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; text-align: center;">📚 Home Dining Tips</h3>
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                First time dining in a Shanghai home? Here are some helpful tips:
              </p>
              
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">Chopstick Etiquette</h4>
                <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                  Hold chopsticks about 1/3 of the way down, rest them on the bowl between bites, and never stick them upright in rice (it resembles a funeral ritual).
                </p>
              </div>

              <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">Dining Etiquette</h4>
                <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                  Wait for the host to start eating, accept food graciously, and try everything offered. It's polite to leave a little food on your plate to show you're satisfied.
                </p>
              </div>

              <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">Useful Phrases</h4>
                <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                  "好吃!" (Hǎo chī!) = Delicious! | "谢谢" (Xièxie) = Thank you | "干杯!" (Gānbēi!) = Cheers!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:foodie@plus1chopsticks.com" style="color: #7c2d12; text-decoration: underline;">foodie@plus1chopsticks.com</a>
              </p>
              <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 11px;">
                © 2026 +1 Chopsticks. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
