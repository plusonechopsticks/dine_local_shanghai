import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  `SELECT id, hostName, status, profilePhotoUrl, foodPhotoUrls
   FROM host_listings
   WHERE status = 'approved'
   ORDER BY id ASC`
);

console.log('\n=== Host Photo URLs (Approved Listings) ===\n');

for (const row of rows) {
  const foodPhotos = Array.isArray(row.foodPhotoUrls)
    ? row.foodPhotoUrls
    : (row.foodPhotoUrls ? JSON.parse(row.foodPhotoUrls) : []);

  console.log(`--- ${row.hostName} (ID: ${row.id}) ---`);
  console.log(`  Profile Photo: ${row.profilePhotoUrl || '❌ MISSING'}`);
  console.log(`  Food Photos (${foodPhotos.length}):`);
  if (foodPhotos.length === 0) {
    console.log('    ❌ NONE');
  } else {
    foodPhotos.forEach((url, i) => {
      const filename = url.split('/').pop();
      console.log(`    ${i+1}. ${filename}`);
    });
  }
  console.log();
}

await conn.end();
