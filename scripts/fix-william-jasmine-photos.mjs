import mysql from 'mysql2/promise';

const foodPhotoUrls = [
  "https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-dinner-spread.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-beef-tomato-soup.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-table-flowers.jpg",
  "https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-shrimp-chicken-spread.jpg"
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  const [result] = await conn.execute(
    'UPDATE host_listings SET foodPhotoUrls = ? WHERE id = 420001',
    [JSON.stringify(foodPhotoUrls)]
  );

  console.log('Update result:', result);

  // Verify
  const [rows] = await conn.execute(
    'SELECT id, hostName, foodPhotoUrls FROM host_listings WHERE id = 420001'
  );
  const listing = rows[0];
  const urls = typeof listing.foodPhotoUrls === 'string' ? JSON.parse(listing.foodPhotoUrls) : listing.foodPhotoUrls;
  console.log('\nVerification — foodPhotoUrls:');
  urls.forEach((url, i) => console.log(`  [${i}] ${url}`));

  await conn.end();
}

main().catch(console.error);
