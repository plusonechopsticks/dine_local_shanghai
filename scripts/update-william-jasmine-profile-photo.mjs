import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  console.log('Uploading profile photo...');
  const result = await cloudinary.uploader.upload('/home/ubuntu/upload/63.jpg', {
    public_id: 'hosts/william-jasmine/profile-couple-tulips',
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
  });

  const profilePhotoUrl = 'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1200/hosts/william-jasmine/profile-couple-tulips.jpg';
  console.log(`Uploaded: ${profilePhotoUrl}`);

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(
    'UPDATE host_listings SET profilePhotoUrl = ? WHERE id = 420001',
    [profilePhotoUrl]
  );
  console.log('Profile photo updated in database.');
  await conn.end();
}

main().catch(console.error);
