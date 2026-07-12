import mysql from 'mysql2/promise';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = 'plusonechopsticks@gmail.com';
const EMAIL_FROM = 'noreply@plus1chopsticks.com';

const HOST_LISTING_ID = 360001;
const HOST_NAME = 'Eating (Yiting)';
const HOST_EMAIL = 'eating311@163.com';
const PRICE_PER_PERSON = 340;

const GUEST_NAME = 'Zuzana Hovorková';
const GUEST_EMAIL = 'zuzahovor@icloud.com';
const NUM_GUESTS = 2;
const TOTAL = PRICE_PER_PERSON * NUM_GUESTS; // 680
const HOST_EARNINGS = Math.round(TOTAL * 0.8); // 544

const EXPERIENCE_DATE = new Date('2026-07-12T11:00:00.000Z'); // Jul 12 7pm CST = 11am UTC
const BOOKING_ID = 1730002;

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Insert the booking
await conn.execute(
  `INSERT INTO bookings 
   (id, hostListingId, guestName, guestEmail, requestedDate, mealType, numberOfGuests, 
    bookingStatus, paymentStatus, totalAmount, reminderEmailSent, reviewEmailSent, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, 'dinner', ?, 'confirmed', 'paid', ?, 0, 0, NOW(), NOW())`,
  [BOOKING_ID, HOST_LISTING_ID, GUEST_NAME, GUEST_EMAIL, EXPERIENCE_DATE, NUM_GUESTS, TOTAL]
);
console.log('Booking created:', BOOKING_ID);

const dateStr = 'Sunday, July 12, 2026 at 7:00 PM';

// Guest confirmation email
const guestHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="text-align: center; padding: 24px 0;">
    <img src="https://res.cloudinary.com/dine-local-shanghai/image/upload/v1/brand/logo.png" alt="+1 Chopsticks" style="height: 48px;" />
  </div>
  <h2 style="color: #c0392b;">🎉 Booking Confirmed!</h2>
  <p>Hi ${GUEST_NAME},</p>
  <p>Your home dining experience is confirmed! Here are your booking details:</p>
  <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold; width:40%;">Host</td><td style="padding:8px;">${HOST_NAME}</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Date & Time</td><td style="padding:8px;">${dateStr}</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Guests</td><td style="padding:8px;">${NUM_GUESTS} adults</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Total Paid</td><td style="padding:8px;">¥${TOTAL}</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Booking Ref</td><td style="padding:8px;">#${BOOKING_ID}</td></tr>
  </table>
  <p>Your host will be in touch with the exact address and any additional details before your experience.</p>
  <p>If you have any questions, please reach out to us at <a href="mailto:${OWNER_EMAIL}">${OWNER_EMAIL}</a>.</p>
  <p>We look forward to welcoming you!</p>
  <p>Warm regards,<br/>The +1 Chopsticks Team</p>
  <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
  <p style="color:#999; font-size:12px; text-align:center;">
    +1 Chopsticks — Authentic Home Dining in Shanghai<br/>
    <a href="https://plus1chopsticks.com" style="color:#c0392b;">plus1chopsticks.com</a>
  </p>
</div>`;

// Host notification email
const hostHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="text-align: center; padding: 24px 0;">
    <img src="https://res.cloudinary.com/dine-local-shanghai/image/upload/v1/brand/logo.png" alt="+1 Chopsticks" style="height: 48px;" />
  </div>
  <h2 style="color: #c0392b;">🍜 New Booking Confirmed!</h2>
  <p>Hi ${HOST_NAME},</p>
  <p>You have a new confirmed booking! Here are the details:</p>
  <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold; width:40%;">Guest</td><td style="padding:8px;">${GUEST_NAME}</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Guest Email</td><td style="padding:8px;"><a href="mailto:${GUEST_EMAIL}">${GUEST_EMAIL}</a></td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Date & Time</td><td style="padding:8px;">${dateStr}</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Guests</td><td style="padding:8px;">${NUM_GUESTS} adults</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Your Earnings</td><td style="padding:8px;">¥${HOST_EARNINGS} (80%)</td></tr>
    <tr><td style="padding:8px; background:#f9f9f9; font-weight:bold;">Booking Ref</td><td style="padding:8px;">#${BOOKING_ID}</td></tr>
  </table>
  <p>Please reach out to your guest to share the address and any preparation details.</p>
  <p>Thank you for hosting with +1 Chopsticks!</p>
  <p>Warm regards,<br/>The +1 Chopsticks Team</p>
  <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
  <p style="color:#999; font-size:12px; text-align:center;">
    +1 Chopsticks — Authentic Home Dining in Shanghai<br/>
    <a href="https://plus1chopsticks.com" style="color:#c0392b;">plus1chopsticks.com</a>
  </p>
</div>`;

// Send guest email
const guestResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: GUEST_EMAIL,
  bcc: OWNER_EMAIL,
  subject: `🎉 Booking Confirmed — Dinner with ${HOST_NAME} on July 12`,
  html: guestHtml,
});
console.log('Guest email sent:', guestResult.data?.id);

// Send host email
const hostResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: HOST_EMAIL,
  bcc: OWNER_EMAIL,
  subject: `🍜 New Booking: ${GUEST_NAME} · July 12 Dinner · ${NUM_GUESTS} guests`,
  html: hostHtml,
});
console.log('Host email sent:', hostResult.data?.id);

await conn.end();
console.log('Done!');
