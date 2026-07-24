import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const OWNER_EMAIL = 'plusonechopsticks@gmail.com';

const bookingId = 2010002;
const diningDateStr = 'Sunday, August 23, 2026 at 7:00 PM';
const hostEmail = '254996071@qq.com'; // Dragon's email from host_listings

// Guest confirmation email
const guestHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - +1 Chopsticks</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#7c2d12;padding:30px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">+1 Chopsticks</h1>
          <p style="margin:8px 0 0 0;color:#fef3c7;font-size:18px;">&#21152;&#19968;&#21452;&#31478;&#23376;</p>
        </td></tr>
        <tr><td style="padding:40px 40px 20px 40px;text-align:center;">
          <div style="width:64px;height:64px;margin:0 auto;background-color:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;color:#16a34a;">&#10003;</span>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <h2 style="margin:0 0 16px 0;color:#1f2937;font-size:24px;font-weight:600;text-align:center;">Your Dining Experience is Confirmed!</h2>
          <p style="margin:0 0 24px 0;color:#6b7280;font-size:16px;line-height:1.6;text-align:center;">
            Your home dining experience with Dragon in Chengdu is now confirmed. We look forward to welcoming you!
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <div style="background-color:#fef3c7;border-left:4px solid #7c2d12;padding:20px;border-radius:4px;">
            <h3 style="margin:0 0 16px 0;color:#7c2d12;font-size:18px;font-weight:600;">Booking Confirmation #${bookingId}</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;width:40%;">Host:</td>
                <td style="color:#1f2937;font-size:14px;">Dragon (Xiaolong)</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Date:</td>
                <td style="color:#1f2937;font-size:14px;">${diningDateStr}</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Meal:</td>
                <td style="color:#1f2937;font-size:14px;">Dinner</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Guests:</td>
                <td style="color:#1f2937;font-size:14px;">4 Adults</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Location:</td>
                <td style="color:#1f2937;font-size:14px;">Chengdu (exact address shared by host)</td>
              </tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <h3 style="margin:0 0 16px 0;color:#1f2937;font-size:18px;font-weight:600;">What Happens Next?</h3>
          <p style="margin:0 0 12px 0;color:#6b7280;font-size:14px;line-height:1.6;">Your host Dragon will contact you within 24-48 hours to:</p>
          <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:14px;line-height:1.8;">
            <li>Share their home address and directions</li>
            <li>Confirm the exact arrival time</li>
            <li>Discuss any dietary preferences or restrictions</li>
            <li>Answer any questions you may have</li>
          </ul>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <div style="background-color:#fef2f2;border:1px solid #fecaca;padding:20px;border-radius:4px;">
            <h3 style="margin:0 0 12px 0;color:#991b1b;font-size:16px;font-weight:600;">Cancellation Policy</h3>
            <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6;">
              You can cancel free of charge up to 7 days before your dining date. Cancellations within 7 days are non-refundable.
              To cancel, contact <strong>plusonechopsticks@gmail.com</strong>.
            </p>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 24px 40px;text-align:center;">
          <p style="margin:0;color:#6b7280;font-size:14px;">
            P.S. Help us improve &mdash;
            <a href="https://plus1chopsticks.com/survey?bookingId=${bookingId}&email=Patricetobler%40icloud.com" style="color:#C9A84C;font-weight:600;">answer 4 quick questions</a> (takes 20 seconds).
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 40px 40px;text-align:center;">
          <p style="margin:0 0 8px 0;color:#1f2937;font-size:16px;font-weight:600;">We're excited for you to experience authentic Chinese home cooking!</p>
          <p style="margin:0;color:#6b7280;font-size:14px;">Warm regards,<br>The +1 Chopsticks Team</p>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:16px 0 8px 0;color:#9ca3af;font-size:11px;line-height:1.7;">
            By confirming this booking, you acknowledge that +1 Chopsticks is a marketplace platform connecting you with an independent host. We do not prepare or serve food and are not liable for the meal, the host's conduct, or any incidents at the host's residence. Please communicate any food allergies or dietary restrictions directly to your host. In an emergency: <strong style="color:#9ca3af;">Police 110 &middot; Medical 120 &middot; Fire 119</strong>. <a href="https://plus1chopsticks.com/disclaimer" style="color:#9ca3af;text-decoration:underline;">Full disclaimer at plus1chopsticks.com/disclaimer</a>
          </p>
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; 2026 +1 Chopsticks | Authentic Chinese Home Dining Experience</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// Host notification email
const hostHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Confirmed Booking - +1 Chopsticks</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#7c2d12;padding:30px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">+1 Chopsticks</h1>
          <p style="margin:8px 0 0 0;color:#fef3c7;font-size:18px;">&#21152;&#19968;&#21452;&#31478;&#23376;</p>
        </td></tr>
        <tr><td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:24px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:24px;font-weight:600;">New Confirmed Booking!</p>
        </td></tr>
        <tr><td style="padding:30px 40px 20px 40px;">
          <p style="margin:0;color:#1f2937;font-size:16px;line-height:1.6;">Dear Dragon,</p>
          <p style="margin:16px 0 0 0;color:#1f2937;font-size:16px;line-height:1.6;">
            Congratulations! You have a new confirmed booking. The guest is excited to experience your authentic Chinese home dining!
          </p>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <div style="background-color:#fef3c7;border-left:4px solid #7c2d12;padding:20px;border-radius:4px;">
            <h3 style="margin:0 0 16px 0;color:#7c2d12;font-size:18px;font-weight:600;">Booking Details #${bookingId}</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;width:40%;">Guest Name:</td>
                <td style="color:#1f2937;font-size:14px;">Patrice Tobler</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Guest Email:</td>
                <td style="color:#1f2937;font-size:14px;"><a href="mailto:Patricetobler@icloud.com" style="color:#7c2d12;text-decoration:none;">Patricetobler@icloud.com</a></td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Date:</td>
                <td style="color:#1f2937;font-size:14px;">${diningDateStr}</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Meal Type:</td>
                <td style="color:#1f2937;font-size:14px;">Dinner</td>
              </tr>
              <tr>
                <td style="color:#78716c;font-size:14px;font-weight:600;">Number of Guests:</td>
                <td style="color:#1f2937;font-size:14px;">4 Adults</td>
              </tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:20px;border-radius:4px;">
            <h3 style="margin:0 0 12px 0;color:#dc2626;font-size:16px;font-weight:600;">Special Note from Booker</h3>
            <div style="background-color:#ffffff;padding:16px;border-radius:4px;">
              <p style="margin:0;color:#1f2937;font-size:14px;line-height:1.6;">
                This booking was made as a <strong>wedding gift</strong> by Patrice's mother Petra. Please contact Patrice directly at <a href="mailto:Patricetobler@icloud.com" style="color:#7c2d12;">Patricetobler@icloud.com</a> to share your address and details.
              </p>
            </div>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <h3 style="margin:0 0 16px 0;color:#1f2937;font-size:18px;font-weight:600;">Next Steps &mdash; Please Complete Within 24-48 Hours</h3>
          <ol style="margin:0;padding-left:20px;color:#6b7280;font-size:14px;line-height:1.8;">
            <li>Contact Patrice at <a href="mailto:Patricetobler@icloud.com" style="color:#7c2d12;">Patricetobler@icloud.com</a></li>
            <li>Share your home address and arrival instructions</li>
            <li>Confirm the exact time (7:00 PM) and any details</li>
            <li>Ask about any dietary restrictions or preferences</li>
          </ol>
        </td></tr>
        <tr><td style="padding:0 40px 30px 40px;">
          <h3 style="margin:0 0 16px 0;color:#1f2937;font-size:18px;font-weight:600;">Important Reminders</h3>
          <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:14px;line-height:1.8;">
            <li>Payment has been confirmed &mdash; no need to collect payment from the guest</li>
            <li>The guest can cancel free of charge up to 7 days before the meal (by August 16)</li>
            <li>Please respond to the guest within 24-48 hours</li>
            <li>Questions? Contact us at <a href="mailto:plusonechopsticks@gmail.com" style="color:#7c2d12;text-decoration:none;">plusonechopsticks@gmail.com</a></li>
          </ul>
        </td></tr>
        <tr><td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; 2026 +1 Chopsticks | Authentic Chinese Home Dining Experience</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// Send guest email
const guestResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: 'Patricetobler@icloud.com',
  bcc: OWNER_EMAIL,
  subject: 'Your Dining Experience with Dragon is Confirmed! — August 23, Chengdu',
  html: guestHtml,
});
console.log('Guest email result:', JSON.stringify(guestResult));

// Send host email
const hostResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: hostEmail,
  bcc: OWNER_EMAIL,
  subject: 'New Confirmed Booking! — 4 Guests on August 23 (Patrice Tobler)',
  html: hostHtml,
});
console.log('Host email result:', JSON.stringify(hostResult));

console.log('\nAll done! Booking ID:', bookingId);
