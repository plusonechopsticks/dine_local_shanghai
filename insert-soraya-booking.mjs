import mysql from 'mysql2/promise';
import { sendEmail } from './server/email.ts';
import { generateBookingConfirmationEmail, generateHostNotificationEmail } from './server/email-templates.ts';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Insert Soraya Lehr's booking — William & Jasmine (420001), July 17 2026, dinner, 2 guests
const [insert] = await conn.execute(
  `INSERT INTO bookings
    (hostListingId, guestName, guestEmail, guestPhone, requestedDate, mealType, numberOfGuests,
     specialRequests, bookingStatus, paymentStatus)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    420001,
    'Soraya Lehr',
    'lehr.soraya@gmail.com',
    '+4915120079473',
    '2026-07-17',
    'dinner',
    2,
    'GYG booking reference: GYG32L4QYHFR',
    'confirmed',
    'paid',
  ]
);
const bookingId = insert.insertId;
console.log('Booking inserted, id:', bookingId);

// Guest confirmation email (no price, no channel)
const guestHtml = generateBookingConfirmationEmail({
  guestName: 'Soraya Lehr',
  bookingId,
  guestEmail: 'lehr.soraya@gmail.com',
  hostName: 'William and Jasmine',
  requestedDate: '2026-07-17',
  mealType: 'dinner',
  numberOfGuests: 2,
  totalAmount: '',       // omitted per rules
  paymentDate: new Date(),
  stripeSessionId: '',   // omitted per rules
});

await sendEmail({
  to: 'lehr.soraya@gmail.com',
  subject: 'Your home dining booking with William and Jasmine is confirmed! 🥢',
  html: guestHtml,
});
console.log('Guest confirmation email sent to lehr.soraya@gmail.com');

// Host notification email (no price, no channel)
const hostHtml = generateHostNotificationEmail({
  bookingId,
  guestName: 'Soraya Lehr',
  guestEmail: 'lehr.soraya@gmail.com',
  guestPhone: '+4915120079473',
  requestedDate: '2026-07-17',
  mealType: 'dinner',
  numberOfGuests: 2,
  totalAmount: 0,        // omitted per rules
  dietaryRestrictions: null,
  hostName: 'William and Jasmine',
  hostEarnings: 0,       // omitted per rules
});

await sendEmail({
  to: 'wuxyey@163.com',
  subject: 'New booking from Soraya Lehr — July 17 dinner 🥢',
  html: hostHtml,
});
console.log('Host notification email sent to wuxyey@163.com');

await conn.end();
console.log('Done.');
