import * as dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
import { Resend } from 'resend';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@plus1chopsticks.com';
const OWNER_EMAIL = 'plusonechopsticks@gmail.com';

const booking = {
  hostListingId: 330001,
  hostName: 'Filbert Kang',
  hostEmail: 'filbertkang@163.com',
  pricePerPerson: 300,
  guestName: 'Karena Punj',
  guestEmail: 'noemail@getyourguide.com', // no email provided by GYG
  guestPhone: '+61452033980',
  requestedDate: '2026-07-05',
  mealType: 'dinner',
  numberOfGuests: 1,
  totalAmount: 300, // 1 adult x ¥300
  status: 'confirmed',
  paymentStatus: 'paid',
  source: 'Get Your Guide',
  gygOrderRef: 'GYG7VKWKZ22N',
  specialRequests: null,
};

// Insert booking
console.log('Creating booking for Karena Punj with Filbert Kang...');
const [result] = await conn.query(
  `INSERT INTO bookings 
    (hostListingId, guestName, guestEmail, guestPhone, requestedDate, mealType, numberOfGuests, totalAmount, bookingStatus, paymentStatus, specialRequests)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    booking.hostListingId,
    booking.guestName,
    booking.guestEmail,
    booking.guestPhone,
    booking.requestedDate,
    booking.mealType,
    booking.numberOfGuests,
    booking.totalAmount,
    booking.status,
    booking.paymentStatus,
    `Get Your Guide order ${booking.gygOrderRef}`,
  ]
);
const bookingId = result.insertId;
console.log(`✓ Booking created with ID: ${bookingId}`);

await conn.end();

// Host earnings (80%)
const hostEarnings = Math.round(booking.totalAmount * 0.8);

// --- Host notification email ---
const hostHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #8B3A3A; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Confirmed Booking!</h1>
  </div>
  <div style="padding: 32px 24px;">
    <p>Hi ${booking.hostName},</p>
    <p>You have a new confirmed booking! Here are the guest details:</p>
    
    <div style="background: #f9f5f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h2 style="color: #8B3A3A; margin-top: 0; font-size: 18px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Booking ID</td><td style="padding: 6px 0; font-weight: bold;">#${bookingId}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guest Name</td><td style="padding: 6px 0; font-weight: bold;">${booking.guestName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guest Phone</td><td style="padding: 6px 0; font-weight: bold;">${booking.guestPhone}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">July 5, 2026</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">7:00 PM</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Meal</td><td style="padding: 6px 0; font-weight: bold;">Dinner</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Number of Guests</td><td style="padding: 6px 0; font-weight: bold;">1 adult</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Booked via</td><td style="padding: 6px 0; font-weight: bold;">Get Your Guide (${booking.gygOrderRef})</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Your Earnings</td><td style="padding: 6px 0; font-weight: bold; color: #2d7a2d;">¥${hostEarnings}</td></tr>
      </table>
    </div>

    <p>Please reach out to ${booking.guestName} at <strong>${booking.guestPhone}</strong> to share your address and any details they need before the meal.</p>
    
    <p>Thank you for being part of +1 Chopsticks!</p>
    
    <p>Warm regards,<br><strong>Steven & the +1 Chopsticks Team</strong></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
    <p>+1 Chopsticks · <a href="https://plus1chopsticks.com" style="color: #8B3A3A;">plus1chopsticks.com</a></p>
  </div>
</div>
`;

// Send host email
console.log(`Sending host notification to ${booking.hostEmail}...`);
const hostResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: booking.hostEmail,
  bcc: OWNER_EMAIL,
  subject: '🎉 New Confirmed Booking! - +1 Chopsticks',
  html: hostHtml,
});
console.log('Host email result:', JSON.stringify(hostResult.data));

// No guest email — no email address provided
console.log('\nNote: No guest email sent (no email address provided for Karena Punj).');
console.log('\nDone!');
