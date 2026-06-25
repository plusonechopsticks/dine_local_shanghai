import mysql from 'mysql2/promise';

// Clean Cloudinary URLs without transformation params (no commas in URL)
const foodUrls = [
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-55.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-56.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-57.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-59.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-60.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-61.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-62.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-54.jpg',
];

const profileUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/profile-couple-dinner.jpg';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Fix the approved listing (480002)
  await conn.execute(
    `UPDATE host_listings 
     SET foodPhotoUrls = ?, profilePhotoUrl = ?, maxGuests = 4
     WHERE id = 480002`,
    [JSON.stringify(foodUrls), profileUrl]
  );
  console.log('Updated listing 480002 with correct photos and maxGuests=4');

  // Delete the old rejected listing (450002)
  // First remove any related availability blocks
  await conn.execute('DELETE FROM host_availability_blocks WHERE hostListingId = 450002');
  await conn.execute('DELETE FROM host_listings WHERE id = 450002');
  console.log('Deleted old rejected listing 450002');

  // Verify
  const [rows] = await conn.execute(
    'SELECT id, hostName, maxGuests, status, profilePhotoUrl FROM host_listings WHERE id = 480002'
  );
  console.log('Verified:', JSON.stringify(rows[0]));

  // Check food photos parsed correctly
  const [photoRows] = await conn.execute('SELECT foodPhotoUrls FROM host_listings WHERE id = 480002');
  const parsed = JSON.parse(photoRows[0].foodPhotoUrls);
  console.log('Food photos count:', parsed.length);
  parsed.forEach((u, i) => console.log(i, u));

  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
