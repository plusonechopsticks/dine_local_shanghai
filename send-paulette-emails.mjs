import { sendEmail } from './server/email.ts';
import { generateBookingConfirmationEmail, generateHostNotificationEmail } from './server/email-templates.ts';

// Booking details
const booking = {
  bookingId: 1950002,
  guestName: 'Paulette York',
  guestEmail: 'pmcyork11@gmail.com',
  hostName: 'William and Jasmine',
  hostEmail: 'wuxyey@163.com',
  requestedDate: '2026-09-09',
  mealType: 'dinner',
  numberOfGuests: 2,
  specialRequests: 'GYG booking reference: GYGX7NA5KR9H',
  pricePerPerson: 340,
};

const totalAmount = booking.pricePerPerson * booking.numberOfGuests; // 680
const hostEarnings = Math.round(totalAmount * 0.70); // 70% = 476

// 1. Guest confirmation email
const guestHtml = generateBookingConfirmationEmail({
  guestName: booking.guestName,
  bookingId: booking.bookingId,
  guestEmail: booking.guestEmail,
  hostName: booking.hostName,
  requestedDate: booking.requestedDate,
  mealType: booking.mealType,
  numberOfGuests: booking.numberOfGuests,
  totalAmount: `¥${totalAmount}`,
  paymentDate: new Date(),
  stripeSessionId: 'GYG-GYGX7NA5KR9H',
});

await sendEmail({
  to: booking.guestEmail,
  subject: `Your home dining booking with ${booking.hostName} is confirmed! 🥢`,
  html: guestHtml,
});
console.log('Guest confirmation email sent to', booking.guestEmail);

// 2. Host notification email
const hostHtml = generateHostNotificationEmail({
  bookingId: booking.bookingId,
  guestName: booking.guestName,
  guestEmail: booking.guestEmail,
  guestPhone: null,
  requestedDate: booking.requestedDate,
  mealType: booking.mealType,
  numberOfGuests: booking.numberOfGuests,
  totalAmount: totalAmount,
  dietaryRestrictions: booking.specialRequests,
  hostName: booking.hostName,
  hostEarnings: hostEarnings,
});

await sendEmail({
  to: booking.hostEmail,
  subject: `New booking from ${booking.guestName} — ${booking.requestedDate} dinner 🥢`,
  html: hostHtml,
});
console.log('Host notification email sent to', booking.hostEmail);

console.log('All emails sent successfully.');
