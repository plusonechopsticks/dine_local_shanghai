import mysql from 'mysql2/promise';

// Correct URLs — no transformation params to avoid comma-splitting issue
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

  const jsonUrls = JSON.stringify(foodUrls);
  console.log('Setting foodPhotoUrls to:', jsonUrls);

  await conn.execute(
    'UPDATE host_listings SET foodPhotoUrls = ?, profilePhotoUrl = ? WHERE id = 480002',
    [jsonUrls, profileUrl]
  );

  // Verify
  const [rows] = await conn.execute(
    'SELECT foodPhotoUrls, profilePhotoUrl FROM host_listings WHERE id = 480002'
  );
  const r = rows[0];
  const parsed = JSON.parse(r.foodPhotoUrls);
  console.log('Verified foodPhotoUrls count:', parsed.length);
  parsed.forEach((u, i) => console.log(i, u));
  console.log('profilePhotoUrl:', r.profilePhotoUrl);

  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
