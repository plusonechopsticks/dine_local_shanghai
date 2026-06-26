import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  'SELECT lifestylePhotoUrls FROM host_listings WHERE id = 480002'
);

const raw = rows[0]?.lifestylePhotoUrls;
const photos = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');

console.log(`Total photos before dedup: ${photos.length}`);

// Deduplicate by extracting the Cloudinary public_id (the unique part of each URL)
// e.g. https://res.cloudinary.com/drxfcfayd/image/upload/v123/hosts/wendi-simon/filename.jpg
// Key on the filename part to catch duplicates regardless of version number
const seen = new Set();
const deduped = photos.filter(url => {
  // Extract everything after the last version segment or after /upload/
  const match = url.match(/\/(?:v\d+\/)?(.+)$/);
  const key = match ? match[1] : url;
  if (seen.has(key)) {
    console.log(`  Removing duplicate: ${key}`);
    return false;
  }
  seen.add(key);
  return true;
});

console.log(`Total photos after dedup: ${deduped.length}`);

await conn.execute(
  'UPDATE host_listings SET lifestylePhotoUrls = ? WHERE id = 480002',
  [JSON.stringify(deduped)]
);

console.log('Done — duplicates removed.');
await conn.end();
