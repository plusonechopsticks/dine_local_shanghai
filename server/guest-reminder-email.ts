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
  <title>Home Dining Cheat Sheets to your +1 Chopsticks Experience</title>
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
                  <strong>Note:</strong> The host's email (${data.hostEmail}) is also copied on this message in case you'd like to reach out proactively!
                </p>
                <p style="margin: 12px 0 0 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>If you haven't received this email, please contact us immediately at <a href="mailto:plusonechopsticks@gmail.com" style="color: #2563eb; text-decoration: underline;">plusonechopsticks@gmail.com</a></strong>
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

          <!-- Home Dining Cheat Sheets -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; text-align: center;">📚 Your Home Dining Cheat Sheets</h3>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                First time dining in a Shanghai home? Don't worry! Here are three helpful guides to make your experience smooth and enjoyable:
              </p>
              
              <!-- Cheat Sheet 1 -->
              <div style="margin-bottom: 24px; text-align: center;">
                <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/gJvoPIaYkJzcUXed.PNG" style="text-decoration: none; display: inline-block; cursor: pointer;">
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/gJvoPIaYkJzcUXed.PNG" alt="Home Dining Cheat Sheet 1: Getting There & Arriving" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;">
                </a>
              </div>
              
              <!-- Cheat Sheet 2 -->
              <div style="margin-bottom: 24px; text-align: center;">
                <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/YRUHjnBjIrOsYeTy.PNG" style="text-decoration: none; display: inline-block; cursor: pointer;">
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/YRUHjnBjIrOsYeTy.PNG" alt="Home Dining Cheat Sheet 2: Chopsticks Manners & Good Etiquette" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;">
                </a>
              </div>
              
              <!-- Cheat Sheet 3 -->
              <div style="text-align: center;">
                <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/fOeqwqkOExiaqFWf.PNG" style="text-decoration: none; display: inline-block; cursor: pointer;">
                  <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/fOeqwqkOExiaqFWf.PNG" alt="Home Dining Cheat Sheet 3: Useful Expressions for the Table" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;">
                </a>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                <strong>Pro tip:</strong> Save these images to your phone for quick reference during your dining experience!
              </p>
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
