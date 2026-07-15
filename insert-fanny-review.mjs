import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const photoUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/v1784040230/reviews/fanny-william-jasmine-review.jpg';

const comment = `As a family visiting from Hong Kong with almost no friends or relatives in the mainland, this was a rare and genuinely meaningful experience for us. Jasmine and William welcomed us so warmly, and the food was wonderful — braised pork belly, sliced beef, shrimp with glass noodles, all clearly made with care.

What made the evening special wasn't just the meal. We talked for hours about education, and about the differences between life in Shanghai and Hong Kong. They're both well-educated and switched easily between Mandarin and English whenever we needed it, so nothing got lost. We came away understanding the city on a much deeper level, and it made our whole trip more meaningful.

Highly recommend to any family or traveler who wants to see a side of China you can't find as a tourist. Thank you both!`;

const [insert] = await conn.execute(
  'INSERT INTO reviews (bookingId, hostListingId, guestName, numberOfGuests, rating, comment, photoUrls, travellerCategory, isPublished) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  [1530002, 420001, 'Fanny', 3, 5, comment, JSON.stringify([photoUrl]), 'families', 1]
);
console.log('Fanny review inserted, id:', insert.insertId);

await conn.end();
