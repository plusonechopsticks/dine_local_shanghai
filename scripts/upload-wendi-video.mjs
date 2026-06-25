import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const LISTING_ID = 480002;
const videoFile = '/home/ubuntu/upload/34_raw.mp4';

console.log('Uploading video (this may take a few minutes for a 74MB file)...');

try {
  const result = await cloudinary.uploader.upload(videoFile, {
    public_id: 'hosts/wendi-simon/intro-video',
    resource_type: 'video',
    overwrite: true,
    timeout: 300000, // 5 minutes
  });
  console.log('Video uploaded:', result.secure_url);

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute('UPDATE host_listings SET introVideoUrl = ? WHERE id = ?', [result.secure_url, LISTING_ID]);
  console.log('Updated introVideoUrl in DB');
  await conn.end();
} catch (err) {
  console.error('Upload failed:', err.message || err);
}
