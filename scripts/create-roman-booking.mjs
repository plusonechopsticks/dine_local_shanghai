import * as dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
import { Resend } from 'resend';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@plus1chopsticks.com';
const OWNER_EMAIL = 'plusonechopsticks@gmail.com';

// Extracted from GYG booking screenshot:
// GYG ref: GYG32L4WQ8MY
// Date: July 6, 2026, 19:00
// Participants: 3 adults + 1 child = 4 total
// Guest email: Roman.mehle@duopol.si
// Host: Filbert Kang (ID 330001), ¥300/person
// Price: 3 adults x ¥300 = ¥900 (child typically free or same price — using 3 adults billed)
const booking = {
  hostListingId: 330001,
  hostName: 'Filbert Kang',
  hostEmail: 'filbertkang@163.com',
  pricePerPerson: 300,
  guestName: 'Roman Mehle',
  guestEmail: 'Roman.mehle@duopol.si',
  guestPhone: null,
  requestedDate: '2026-07-06',
  mealType: 'dinner',
  numberOfGuests: 4, // 3 adults + 1 child
  totalAmount: 900, // 3 adults x ¥300 (child not charged)
  status: 'confirmed',
  paymentStatus: 'paid',
  gygOrderRef: 'GYG32L4WQ8MY',
  specialRequests: 'Group: 3 adults + 1 child. Booked via Get Your Guide (GYG32L4WQ8MY).',
};

const hostEarnings = Math.round(booking.totalAmount * 0.8);

// Insert booking
console.log('Creating booking for Roman Mehle with Filbert Kang...');
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
    booking.specialRequests,
  ]
);
const bookingId = result.insertId;
console.log(`✓ Booking created with ID: ${bookingId}`);
await conn.end();

// --- Guest confirmation email ---
const guestHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #8B3A3A; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Your Dining Experience is Confirmed!</h1>
  </div>
  <div style="padding: 32px 24px;">
    <p>Hi ${booking.guestName},</p>
    <p>Great news! Your home dining experience with <strong>${booking.hostName}</strong> has been confirmed. We can't wait for you to enjoy an authentic home-cooked meal!</p>
    
    <div style="background: #f9f5f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h2 style="color: #8B3A3A; margin-top: 0; font-size: 18px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Booking ID</td><td style="padding: 6px 0; font-weight: bold;">#${bookingId}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Host</td><td style="padding: 6px 0; font-weight: bold;">${booking.hostName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">July 6, 2026</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">7:00 PM</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Meal</td><td style="padding: 6px 0; font-weight: bold;">Dinner</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td style="padding: 6px 0; font-weight: bold;">3 adults + 1 child</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Booked via</td><td style="padding: 6px 0; font-weight: bold;">Get Your Guide</td></tr>
      </table>
    </div>

    <p>Your host will be in touch with you directly to share their address and any final details before the meal. If you have any questions in the meantime, feel free to reply to this email.</p>
    
    <p>We hope you have an unforgettable experience!</p>
    
    <p>Warm regards,<br><strong>Steven & the +1 Chopsticks Team</strong></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
    <p>+1 Chopsticks · <a href="https://plus1chopsticks.com" style="color: #8B3A3A;">plus1chopsticks.com</a></p>
  </div>
</div>
`;

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
        <tr><td style="padding: 6px 0; color: #666;">Guest Email</td><td style="padding: 6px 0; font-weight: bold;">${booking.guestEmail}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">July 6, 2026</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">7:00 PM</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Meal</td><td style="padding: 6px 0; font-weight: bold;">Dinner</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Number of Guests</td><td style="padding: 6px 0; font-weight: bold;">3 adults + 1 child</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Booked via</td><td style="padding: 6px 0; font-weight: bold;">Get Your Guide (${booking.gygOrderRef})</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Your Earnings</td><td style="padding: 6px 0; font-weight: bold; color: #2d7a2d;">¥${hostEarnings}</td></tr>
      </table>
    </div>

    <p>Please reach out to ${booking.guestName} at <a href="mailto:${booking.guestEmail}">${booking.guestEmail}</a> to share your address and any details they need before the meal.</p>
    
    <p>Thank you for being part of +1 Chopsticks!</p>
    
    <p>Warm regards,<br><strong>Steven & the +1 Chopsticks Team</strong></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
    <p>+1 Chopsticks · <a href="https://plus1chopsticks.com" style="color: #8B3A3A;">plus1chopsticks.com</a></p>
  </div>
</div>
`;

// Send guest email
console.log(`Sending guest confirmation to ${booking.guestEmail}...`);
const guestResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: booking.guestEmail,
  bcc: OWNER_EMAIL,
  subject: '🎉 Your Dining Experience is Confirmed! - +1 Chopsticks',
  html: guestHtml,
});
console.log('Guest email result:', JSON.stringify(guestResult.data));

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

console.log('\nDone!');
