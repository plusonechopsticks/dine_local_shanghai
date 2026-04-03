/**
 * Host Reminder Email Template
 * Sent 48 hours before the dining experience to remind the host
 */

interface HostReminderData {
  hostName: string;
  guestName: string;
  guestEmail: string;
  experienceDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  cuisine: string;
}

export function generateHostReminderEmail(data: HostReminderData): string {
  // Parse the ISO date string - the date is already in local time format
  const dateStr = data.experienceDate.split('T')[0]; // Get YYYY-MM-DD part: "2026-03-23"
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Create a date object using UTC to avoid timezone conversion
  const shanghaiDate = new Date(Date.UTC(year, month - 1, day));
  
  const formattedDate = shanghaiDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Use UTC to prevent timezone conversion
  });

  // Determine meal time
  const mealTime = data.mealType === 'lunch' ? '12:00 PM (Noon)' : '7:00 PM';
  const mealEmoji = data.mealType === 'lunch' ? '🍜' : '🍽️';
  
  console.log('[Host Email Template] Date string:', data.experienceDate, 'Parsed date:', dateStr, 'Formatted:', formattedDate);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your +1 Chopsticks Hosting Experience Reminder</title>
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
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Hi ${data.hostName}! Your Dining Experience is in 2 Days! ${mealEmoji}</h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                Get ready to welcome ${data.guestName} for an authentic home dining experience!
              </p>
            </td>
          </tr>

          <!-- Guest Details -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #7c2d12; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 16px 0; color: #7c2d12; font-size: 18px; font-weight: 600;">Guest Information</h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600; width: 40%;">Guest Name:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.guestName}</td>
                  </tr>
                  <tr>
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Guest Email:</td>
                    <td style="color: #1f2937; font-size: 14px;"><a href="mailto:${data.guestEmail}" style="color: #2563eb; text-decoration: underline;">${data.guestEmail}</a></td>
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
                    <td style="color: #78716c; font-size: 14px; font-weight: 600;">Party Size:</td>
                    <td style="color: #1f2937; font-size: 14px;">${data.numberOfGuests} ${data.numberOfGuests === 1 ? 'guest' : 'guests'}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Preparation Tips -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Quick Reminders</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                <li>Prepare your ${data.cuisine} dishes</li>
                <li>Ensure your home is clean and welcoming</li>
                <li>Have any dietary restrictions discussed with the guest confirmed</li>
                <li>Plan for a 2-3 hour experience</li>
                <li>Be ready to share stories and connect with your guest</li>
              </ul>
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Need Help?</h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  If you need to reschedule or have any questions, please contact us at <a href="mailto:plusonechopsticks@gmail.com" style="color: #2563eb; text-decoration: underline;">plusonechopsticks@gmail.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                Thank you for being part of the +1 Chopsticks community!
              </h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Warm regards,<br>
                <strong>The +1 Chopsticks Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © 2026 +1 Chopsticks | Authentic Chinese Home Dining Experiences
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
