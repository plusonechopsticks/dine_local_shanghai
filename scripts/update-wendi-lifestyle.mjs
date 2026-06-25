import mysql from 'mysql2/promise';

const LISTING_ID = 480002;

const newPhotos = [
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406322/hosts/wendi-simon/39-1782406317127.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406325/hosts/wendi-simon/33bf1648f852bf9a2948e5bd1340e38d-1782406323476.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406328/hosts/wendi-simon/0c5ba12ceede946af86b14e6176e663f-1782406326422.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406332/hosts/wendi-simon/72f0e9886547b107e395ebdc876c8792-1782406329608.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406334/hosts/wendi-simon/6b57ba553fa5c82b5728d7029422bbc4-1782406333395.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406339/hosts/wendi-simon/ea96992911cc3d6e9b485a2afc21db57-1782406335728.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406342/hosts/wendi-simon/b2129fbea2945d0090d32e6dc3abd683-1782406340695.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406345/hosts/wendi-simon/c8cca3a92cfcfc33d186f2e1884dbec2-1782406343406.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406348/hosts/wendi-simon/7f25b04bffac30fa5b035a446ff2eb8d-1782406346028.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406355/hosts/wendi-simon/3ae6513431e9164e9a443b5898b59b12-1782406349494.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1782406358/hosts/wendi-simon/921c46c290402a3066aa58b7a3fd36da-1782406356064.jpg',
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute('SELECT lifestylePhotoUrls FROM host_listings WHERE id = ?', [LISTING_ID]);
const current = rows[0]?.lifestylePhotoUrls || [];
const existing = Array.isArray(current) ? current : JSON.parse(current || '[]');
console.log('Current lifestyle photos:', existing.length);

const existingSet = new Set(existing);
const merged = [...existing];
let added = 0;
for (const url of newPhotos) {
  if (!existingSet.has(url)) {
    merged.push(url);
    added++;
  }
}

await conn.execute('UPDATE host_listings SET lifestylePhotoUrls = ? WHERE id = ?', [JSON.stringify(merged), LISTING_ID]);
console.log('Updated lifestyle photos:', merged.length, '(added', added, 'new)');
await conn.end();
console.log('Done!');
