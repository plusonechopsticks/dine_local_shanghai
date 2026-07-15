import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// William & Jasmine: ID 420001, ¥340/person, 2 guests = ¥680 total
// GYG booking — do NOT store price (GYG handles payment)
// Date: September 9, 2026, 7:00 PM = dinner
const [insert] = await conn.execute(
  `INSERT INTO bookings
    (hostListingId, guestName, guestEmail, requestedDate, mealType, numberOfGuests,
     specialRequests, bookingStatus, paymentStatus)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    420001,
    'Paulette York',
    'pmcyork11@gmail.com',
    '2026-09-09',
    'dinner',
    2,
    'GYG booking reference: GYGX7NA5KR9H',
    'confirmed',
    'paid',
  ]
);
console.log('Booking inserted, id:', insert.insertId);

await conn.end();
