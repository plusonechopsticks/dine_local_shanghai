import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Soraya's booking for Eating (Yiting) is 1980002
// travellerCategory: 'couples' (they came as a couple with friends)
const [insert] = await conn.execute(
  `INSERT INTO reviews
    (hostListingId, bookingId, guestName, rating, comment, travellerCategory, photoUrls, isPublished)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    360001, // Eating (Yiting)
    1980002, // Soraya's booking
    'Soraya & Leonardo',
    5,
    'It was lovely, the host was super friendly and the food was great!',
    'friends_couples',
    JSON.stringify(['https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/VCVHteYvonpyDDbf.jpeg']),
    1,
  ]
);
console.log('Review inserted, id:', insert.insertId);

await conn.end();
console.log('Done.');
