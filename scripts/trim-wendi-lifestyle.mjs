import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  'SELECT lifestylePhotoUrls FROM host_listings WHERE id = 480002'
);

const raw = rows[0]?.lifestylePhotoUrls;
const photos = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');

// Keep only photos 12–22 (index 11–21) — the new named batch
const kept = photos.slice(11);

console.log(`Before: ${photos.length} photos`);
console.log(`After:  ${kept.length} photos`);
kept.forEach((url, i) => console.log(`  ${i+1}. ${url.split('/').pop()}`));

await conn.execute(
  'UPDATE host_listings SET lifestylePhotoUrls = ? WHERE id = 480002',
  [JSON.stringify(kept)]
);

console.log('\nDone — old duplicate photos removed.');
await conn.end();
