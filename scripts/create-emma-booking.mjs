import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Dragon listing ID: 390001, pricePerPerson: 280
// 4 adults = 1120 total
const totalAmount = 280 * 4;

await conn.execute(
  `INSERT INTO bookings (hostListingId, guestName, guestEmail, guestPhone, requestedDate, mealType, numberOfGuests, bookingStatus, paymentStatus, totalAmount, hostNotes, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    390001,
    'Emma Grimaldi',
    'emmagrimaldi@gmail.com',
    '+16467173533',
    '2026-08-15',
    'dinner',
    4,
    'confirmed',
    'paid',
    totalAmount,
    'Booked via Get Your Guide',
  ]
);

console.log(`Booking created for Emma Grimaldi — Dragon, Aug 15 2026, 4 adults, ¥${totalAmount} total`);
await conn.end();
