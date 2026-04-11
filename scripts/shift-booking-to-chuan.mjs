/**
 * One-off script: Shift Joshua Frey's booking (ID 930001) from Grace Tong to Chuan 川 (host 180001)
 * and send new confirmation emails to both the guest and the host.
 */
import mysql from 'mysql2/promise';
import { Resend } from 'resend';

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = 'noreply@plus1chopsticks.com';
const OWNER_EMAIL = 'plusonechopsticks@gmail.com';

const BOOKING_ID = 930001;
const NEW_HOST_ID = 180001;
const NEW_HOST_NAME = 'Chuan 川';
const NEW_HOST_EMAIL = '61727165@qq.com';
const HOST_EARNINGS_PERCENT = 0.70; // 70% to host

const resend = new Resend(RESEND_API_KEY);

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  // 1. Fetch the current booking
  const [bookingRows] = await conn.execute('SELECT * FROM bookings WHERE id = ?', [BOOKING_ID]);
  const booking = bookingRows[0];
  if (!booking) throw new Error(`Booking ${BOOKING_ID} not found`);

  console.log('Current booking:', {
    id: booking.id,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    hostListingId: booking.hostListingId,
    requestedDate: booking.requestedDate,
    mealType: booking.mealType,
    numberOfGuests: booking.numberOfGuests,
    totalAmount: booking.totalAmount,
    bookingStatus: booking.bookingStatus,
  });

  // 2. Update the booking to point to Chuan
  await conn.execute(
    'UPDATE bookings SET hostListingId = ?, updatedAt = NOW() WHERE id = ?',
    [NEW_HOST_ID, BOOKING_ID]
  );
  console.log(`✅ Booking ${BOOKING_ID} shifted to host ${NEW_HOST_ID} (${NEW_HOST_NAME})`);

  // 3. Prepare email data
  const requestedDate = booking.requestedDate instanceof Date
    ? booking.requestedDate.toISOString().split('T')[0]
    : String(booking.requestedDate).split('T')[0];

  const totalAmount = parseFloat(booking.totalAmount || '0');
  const hostEarnings = Math.round(totalAmount * HOST_EARNINGS_PERCENT);

  // 4. Send guest confirmation email
  const guestHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Update — +1 Chopsticks</title></head>
<body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #1a1a1a; padding: 32px 40px; text-align: center;">
      <p style="color: #d4af37; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">+1 Chopsticks</p>
      <h1 style="color: #fff; font-size: 26px; margin: 0;">Your Booking Has Been Updated</h1>
    </div>
    <div style="padding: 40px;">
      <p style="color: #333; font-size: 16px;">Dear <strong>${booking.guestName}</strong>,</p>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        We wanted to let you know that your dining experience has been reassigned to a new host. Your booking details remain the same — only the host has changed.
      </p>
      <div style="background: #f9f6f0; border-left: 4px solid #d4af37; padding: 20px 24px; border-radius: 4px; margin: 24px 0;">
        <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">Updated Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0; width: 40%;">Booking ID</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">#${BOOKING_ID}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Your Host</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${NEW_HOST_NAME}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Date</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${requestedDate}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Meal</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-transform: capitalize;">${booking.mealType}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Guests</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${booking.numberOfGuests}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Amount Paid</td><td style="color: #c0392b; font-size: 16px; font-weight: bold;">¥${totalAmount.toFixed(0)}</td></tr>
        </table>
      </div>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        Your host will be in touch with the exact address and meeting instructions closer to the date. If you have any questions, please reply to this email.
      </p>
      <p style="color: #555; font-size: 15px; margin-top: 32px;">We look forward to welcoming you,<br><strong style="color: #1a1a1a;">The +1 Chopsticks Team</strong></p>
    </div>
    <div style="background: #f5f5f5; padding: 20px 40px; text-align: center;">
      <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 +1 Chopsticks · Shanghai</p>
    </div>
  </div>
</body>
</html>`;

  const guestResult = await resend.emails.send({
    from: EMAIL_FROM,
    to: booking.guestEmail,
    bcc: OWNER_EMAIL,
    subject: `Your Booking Has Been Updated — Now with ${NEW_HOST_NAME} · +1 Chopsticks`,
    html: guestHtml,
  });
  console.log(`✅ Guest confirmation email sent to ${booking.guestEmail}:`, guestResult);

  // 5. Send host confirmation email
  const hostHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Booking — +1 Chopsticks</title></head>
<body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #1a1a1a; padding: 32px 40px; text-align: center;">
      <p style="color: #d4af37; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">+1 Chopsticks</p>
      <h1 style="color: #fff; font-size: 26px; margin: 0;">🎉 New Confirmed Booking!</h1>
    </div>
    <div style="padding: 40px;">
      <p style="color: #333; font-size: 16px;">Dear <strong>${NEW_HOST_NAME}</strong>,</p>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        Great news — you have a new confirmed dining guest! Here are the details:
      </p>
      <div style="background: #f9f6f0; border-left: 4px solid #d4af37; padding: 20px 24px; border-radius: 4px; margin: 24px 0;">
        <h3 style="color: #1a1a1a; margin: 0 0 16px; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0; width: 40%;">Booking ID</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">#${BOOKING_ID}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Guest Name</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${booking.guestName}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Guest Email</td><td style="color: #1a1a1a; font-size: 14px;">${booking.guestEmail}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Date</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${requestedDate}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Meal</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-transform: capitalize;">${booking.mealType}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Number of Guests</td><td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${booking.numberOfGuests}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Dietary / Special Requests</td><td style="color: #1a1a1a; font-size: 14px;">${booking.specialRequests || 'None'}</td></tr>
          <tr><td style="color: #888; font-size: 13px; padding: 6px 0;">Your Earnings</td><td style="color: #27ae60; font-size: 16px; font-weight: bold;">¥${hostEarnings}</td></tr>
        </table>
      </div>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">
        <strong>Next steps:</strong> Please reach out to your guest to confirm the exact address, meeting time, and any other details. You can reply directly to their email: <a href="mailto:${booking.guestEmail}" style="color: #c0392b;">${booking.guestEmail}</a>
      </p>
      <p style="color: #555; font-size: 14px; line-height: 1.6; background: #fff8e7; padding: 16px; border-radius: 4px;">
        💰 <strong>Payment note:</strong> Funds (¥${hostEarnings}) will be released to you 7–14 days after the dining experience is complete.
      </p>
      <p style="color: #555; font-size: 15px; margin-top: 32px;">Thank you for being part of +1 Chopsticks!<br><strong style="color: #1a1a1a;">The +1 Chopsticks Team</strong></p>
    </div>
    <div style="background: #f5f5f5; padding: 20px 40px; text-align: center;">
      <p style="color: #aaa; font-size: 12px; margin: 0;">© 2026 +1 Chopsticks · Shanghai</p>
    </div>
  </div>
</body>
</html>`;

  const hostResult = await resend.emails.send({
    from: EMAIL_FROM,
    to: NEW_HOST_EMAIL,
    bcc: OWNER_EMAIL,
    subject: `🎉 New Confirmed Booking — ${booking.guestName} on ${requestedDate} · +1 Chopsticks`,
    html: hostHtml,
  });
  console.log(`✅ Host confirmation email sent to ${NEW_HOST_EMAIL}:`, hostResult);

  await conn.end();
  console.log('\n✅ All done! Booking shifted and emails sent.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
