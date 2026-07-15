import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const photoUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/v1784040741/reviews/zuzana-alex-eating-yiting-review.jpg';
const comment = `We enjoyed it very much, thank you for your time, conversation and lovely meal!`;

// Booking 1730002 = Zuzana Hovorková at Eating (Yiting), listing 360001
const [insert] = await conn.execute(
  'INSERT INTO reviews (bookingId, hostListingId, guestName, numberOfGuests, rating, comment, photoUrls, travellerCategory, isPublished) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  [1730002, 360001, 'Zuzana', 2, 5, comment, JSON.stringify([photoUrl]), 'friends_couples', 1]
);
console.log('Zuzana review inserted, id:', insert.insertId);

await conn.end();
