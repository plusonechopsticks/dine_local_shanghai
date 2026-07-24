import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cloudinary = require('cloudinary').v2;
const mysql = require('mysql2/promise');
import { config } from 'dotenv';
config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploads = [
  { file: '/home/ubuntu/upload/71.png',   publicId: 'michelle-family-profile', listingId: 530003, name: "Michelle's Family" },
  { file: '/home/ubuntu/upload/70.png',   publicId: 'melody-duke-profile',     listingId: 520003, name: 'Melody & Duke' },
  { file: '/home/ubuntu/upload/72.jpeg',  publicId: 'xirui-profile',           listingId: 510003, name: 'Xirui (Siri)' },
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const { file, publicId, listingId, name } of uploads) {
  const r = await cloudinary.uploader.upload(file, {
    folder: 'host-photos',
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });
  await conn.execute('UPDATE host_listings SET profilePhotoUrl = ? WHERE id = ?', [r.secure_url, listingId]);
  console.log(`✓ ${name} (${listingId}): ${r.secure_url}`);
}

await conn.end();
console.log('All profile photos updated.');
