import { sendEmail } from './server/email.ts';
import { generateBookingConfirmationEmail, generateHostNotificationEmail } from './server/email-templates.ts';

// Corrected: host is Eating (Yiting), not William and Jasmine
const bookingId = 1980002;

// Guest confirmation email
const guestHtml = generateBookingConfirmationEmail({
  guestName: 'Soraya Lehr',
  bookingId,
  guestEmail: 'lehr.soraya@gmail.com',
  hostName: 'Eating (Yiting)',
  requestedDate: '2026-07-17',
  mealType: 'dinner',
  numberOfGuests: 2,
  totalAmount: '',
  paymentDate: new Date(),
  stripeSessionId: '',
});

await sendEmail({
  to: 'lehr.soraya@gmail.com',
  subject: 'Your home dining booking with Eating (Yiting) is confirmed! 🥢',
  html: guestHtml,
});
console.log('Guest confirmation email sent to lehr.soraya@gmail.com');

// Host notification email to Eating (Yiting)
const hostHtml = generateHostNotificationEmail({
  bookingId,
  guestName: 'Soraya Lehr',
  guestEmail: 'lehr.soraya@gmail.com',
  guestPhone: '+4915120079473',
  requestedDate: '2026-07-17',
  mealType: 'dinner',
  numberOfGuests: 2,
  totalAmount: 0,
  dietaryRestrictions: null,
  hostName: 'Eating (Yiting)',
  hostEarnings: 0,
});

await sendEmail({
  to: 'eating311@163.com',
  subject: 'New booking from Soraya Lehr — July 17 dinner 🥢',
  html: hostHtml,
});
console.log('Host notification email sent to eating311@163.com');

console.log('Done.');
