import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photos = [
  { file: '/home/ubuntu/upload/43.jpeg', publicId: 'hosts/william-jasmine/william-horse-riding' },
  { file: '/home/ubuntu/upload/da1e045aaa83ff976c0217dce12413d1.jpg', publicId: 'hosts/william-jasmine/jasmine-winter-hiking' },
  { file: '/home/ubuntu/upload/45.jpeg', publicId: 'hosts/william-jasmine/jasmine-fishing' },
];

async function main() {
  const uploadedUrls = [];

  for (const photo of photos) {
    console.log(`Uploading ${photo.publicId}...`);
    const result = await cloudinary.uploader.upload(photo.file, {
      public_id: photo.publicId,
      overwrite: true,
      transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1600, crop: 'limit' }],
    });
    const url = `https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/${photo.publicId}.jpg`;
    console.log(`  -> ${url}`);
    uploadedUrls.push(url);
  }

  // Fetch current foodPhotoUrls
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute('SELECT foodPhotoUrls FROM host_listings WHERE id = 420001');
  const current = rows[0].foodPhotoUrls;
  const existing = typeof current === 'string' ? JSON.parse(current) : current;

  const updated = [...existing, ...uploadedUrls];
  console.log('\nUpdated foodPhotoUrls array:');
  updated.forEach((u, i) => console.log(`  [${i}] ${u}`));

  await conn.execute(
    'UPDATE host_listings SET foodPhotoUrls = ? WHERE id = 420001',
    [JSON.stringify(updated)]
  );
  console.log('\nDatabase updated successfully.');
  await conn.end();
}

main().catch(console.error);
