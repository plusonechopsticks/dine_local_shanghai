import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  'SELECT lifestylePhotoUrls FROM host_listings WHERE id = 480002'
);

const raw = rows[0]?.lifestylePhotoUrls;
const photos = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');

console.log(`\nWendi & Simon lifestyle photos (${photos.length} total):\n`);
photos.forEach((url, i) => {
  // Extract just the filename for readability
  const filename = url.split('/').pop();
  console.log(`${String(i+1).padStart(2)}. ${filename}`);
  console.log(`    ${url}`);
});

await conn.end();
