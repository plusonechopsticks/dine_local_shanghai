import mysql from 'mysql2/promise';
import { Resend } from 'resend';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);

const OWNER_EMAIL = 'plusonechopsticks@gmail.com';

// Booking details
const hostListingId = 390001;
const hostName = 'Dragon (Xiaolong) 小龙';
const hostEmail = '254996071@qq.com';
const guestName = 'Denise Riedler';
const guestEmail = 'denisewerbung@gmx.at';
const numberOfGuests = 2;
const requestedDate = new Date('2026-07-15T19:00:00+08:00');
const mealType = 'dinner';
const totalAmount = 560; // 2 x ¥280 — stored in DB but NOT shown in emails
const gygRef = 'GYG2Q9HHQ47Q';

// Insert booking
const [result] = await conn.execute(
  `INSERT INTO bookings (hostListingId, guestName, guestEmail, numberOfGuests, requestedDate, mealType, totalAmount, bookingStatus, paymentStatus, hostNotes, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, NOW(), NOW())`,
  [hostListingId, guestName, guestEmail, numberOfGuests, requestedDate, mealType, totalAmount, `GYG Ref: ${gygRef}`]
);
const bookingId = result.insertId;
console.log('Booking created:', bookingId);

// Format date
const dateStr = requestedDate.toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  timeZone: 'Asia/Shanghai'
});
const timeStr = '7:00 PM';

// Guest confirmation email (no price)
const guestHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; }
  .header { background: #8B1A1A; padding: 32px 40px; text-align: center; }
  .header h1 { color: #fff; font-size: 24px; margin: 0; }
  .header p { color: #f0d9b5; margin: 8px 0 0; font-size: 14px; }
  .body { padding: 40px; }
  .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0ece4; }
  .detail-label { color: #888; font-size: 14px; }
  .detail-value { font-weight: bold; font-size: 14px; }
  .footer { background: #f5f0e8; padding: 24px 40px; text-align: center; font-size: 12px; color: #999; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎉 Booking Confirmed!</h1>
    <p>Your home dining experience is set</p>
  </div>
  <div class="body">
    <p>Dear ${guestName},</p>
    <p>Your booking with <strong>${hostName}</strong> is confirmed. We look forward to welcoming you!</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin: 24px 0;">
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Booking ID</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">#${bookingId}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Host</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${hostName}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Date</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${dateStr}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Time</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${timeStr}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Guests</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${numberOfGuests}</td></tr>
    </table>
    <p>Your host will be in touch with you directly to share their address and any other details.</p>
    <p>If you have any questions, please reply to this email or contact us at <a href="mailto:${OWNER_EMAIL}">${OWNER_EMAIL}</a>.</p>
    <p>We hope you have a wonderful experience!</p>
    <p>Warm regards,<br><strong>+1 Chopsticks</strong></p>
  </div>
  <div class="footer">+1 Chopsticks · <a href="https://plus1chopsticks.com">plus1chopsticks.com</a></div>
</div>
</body>
</html>`;

// Host notification email (no price)
const hostHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; }
  .header { background: #2d5a27; padding: 32px 40px; text-align: center; }
  .header h1 { color: #fff; font-size: 24px; margin: 0; }
  .header p { color: #c8e6c9; margin: 8px 0 0; font-size: 14px; }
  .body { padding: 40px; }
  .footer { background: #f5f0e8; padding: 24px 40px; text-align: center; font-size: 12px; color: #999; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🍜 New Booking!</h1>
    <p>A guest has confirmed their dinner with you</p>
  </div>
  <div class="body">
    <p>Hi ${hostName},</p>
    <p>You have a new confirmed booking. Here are the guest details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin: 24px 0;">
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Booking ID</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">#${bookingId}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Guest</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${guestName}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Guest Email</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;"><a href="mailto:${guestEmail}">${guestEmail}</a></td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Date</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${dateStr}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Time</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${timeStr}</td></tr>
      <tr><td style="padding:10px 0; border-bottom:1px solid #f0ece4; color:#888; font-size:14px;">Guests</td><td style="padding:10px 0; border-bottom:1px solid #f0ece4; font-weight:bold; font-size:14px; text-align:right;">${numberOfGuests}</td></tr>
    </table>
    <p>Please reach out to your guest directly to share your address and any preparation details.</p>
    <p>Thank you for hosting with +1 Chopsticks!</p>
    <p>Warm regards,<br><strong>+1 Chopsticks Team</strong></p>
  </div>
  <div class="footer">+1 Chopsticks · <a href="https://plus1chopsticks.com">plus1chopsticks.com</a></div>
</div>
</body>
</html>`;

// Send guest email
const guestRes = await resend.emails.send({
  from: 'noreply@plus1chopsticks.com',
  to: guestEmail,
  bcc: OWNER_EMAIL,
  subject: `Booking Confirmed — Dinner with ${hostName} on ${dateStr}`,
  html: guestHtml,
});
console.log('Guest email sent:', guestRes.data?.id);

// Send host email
const hostRes = await resend.emails.send({
  from: 'noreply@plus1chopsticks.com',
  to: hostEmail,
  bcc: OWNER_EMAIL,
  subject: `New Booking — ${guestName} · ${dateStr}`,
  html: hostHtml,
});
console.log('Host email sent:', hostRes.data?.id);

await conn.end();
console.log('Done!');
