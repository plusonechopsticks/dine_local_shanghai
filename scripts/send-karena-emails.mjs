import * as dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@plus1chopsticks.com';
const OWNER_EMAIL = 'plusonechopsticks@gmail.com';

const booking = {
  id: 1680002,
  hostName: 'Filbert Kang',
  hostEmail: 'filbertkang@163.com',
  guestName: 'Karena Punj',
  guestEmail: 'karena101010@gmail.com',
  guestPhone: '+61452033980',
  date: 'July 5, 2026',
  time: '7:00 PM',
  mealType: 'Dinner',
  numberOfGuests: 1,
  totalAmountUSD: 8,
  gygOrderRef: 'GYG7VKWKZ22N',
};

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
        <tr><td style="padding: 6px 0; color: #666;">Booking ID</td><td style="padding: 6px 0; font-weight: bold;">#${booking.id}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Host</td><td style="padding: 6px 0; font-weight: bold;">${booking.hostName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">${booking.date}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">${booking.time}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Meal</td><td style="padding: 6px 0; font-weight: bold;">${booking.mealType}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td style="padding: 6px 0; font-weight: bold;">${booking.numberOfGuests} adult</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Amount Paid</td><td style="padding: 6px 0; font-weight: bold;">USD $${booking.totalAmountUSD}</td></tr>
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
        <tr><td style="padding: 6px 0; color: #666;">Booking ID</td><td style="padding: 6px 0; font-weight: bold;">#${booking.id}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guest Name</td><td style="padding: 6px 0; font-weight: bold;">${booking.guestName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guest Email</td><td style="padding: 6px 0; font-weight: bold;">${booking.guestEmail}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guest Phone</td><td style="padding: 6px 0; font-weight: bold;">${booking.guestPhone}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold;">${booking.date}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold;">${booking.time}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Meal</td><td style="padding: 6px 0; font-weight: bold;">${booking.mealType}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Number of Guests</td><td style="padding: 6px 0; font-weight: bold;">${booking.numberOfGuests} adult</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Booked via</td><td style="padding: 6px 0; font-weight: bold;">Get Your Guide (${booking.gygOrderRef})</td></tr>
      </table>
    </div>

    <p>Please reach out to ${booking.guestName} at <a href="mailto:${booking.guestEmail}">${booking.guestEmail}</a> or ${booking.guestPhone} to share your address and any details they need before the meal.</p>
    
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
console.log(`Sending updated host notification to ${booking.hostEmail}...`);
const hostResult = await resend.emails.send({
  from: EMAIL_FROM,
  to: booking.hostEmail,
  bcc: OWNER_EMAIL,
  subject: '🎉 New Confirmed Booking! (Updated) - +1 Chopsticks',
  html: hostHtml,
});
console.log('Host email result:', JSON.stringify(hostResult.data));

console.log('\nDone!');
