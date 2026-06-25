import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const require = createRequire(import.meta.url);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const LISTING_ID = 480002;

const photoFiles = [
  '/home/ubuntu/upload/39.jpg',
  '/home/ubuntu/upload/33bf1648f852bf9a2948e5bd1340e38d.jpg',
  '/home/ubuntu/upload/0c5ba12ceede946af86b14e6176e663f.jpg',
  '/home/ubuntu/upload/72f0e9886547b107e395ebdc876c8792.jpg',
  '/home/ubuntu/upload/6b57ba553fa5c82b5728d7029422bbc4.jpg',
  '/home/ubuntu/upload/ea96992911cc3d6e9b485a2afc21db57.jpg',
  '/home/ubuntu/upload/b2129fbea2945d0090d32e6dc3abd683.jpg',
  '/home/ubuntu/upload/c8cca3a92cfcfc33d186f2e1884dbec2.jpg',
  '/home/ubuntu/upload/7f25b04bffac30fa5b035a446ff2eb8d.jpg',
  '/home/ubuntu/upload/3ae6513431e9164e9a443b5898b59b12.jpg',
  '/home/ubuntu/upload/921c46c290402a3066aa58b7a3fd36da.jpg',
];

const videoFile = '/home/ubuntu/upload/34_raw.mp4';

async function uploadFile(filePath, folder, resourceType = 'image') {
  const baseName = path.basename(filePath, path.extname(filePath)).replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const publicId = `hosts/wendi-simon/${baseName}-${Date.now()}`;
  console.log(`Uploading ${path.basename(filePath)}...`);
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: resourceType,
    overwrite: false,
  });
  console.log(`  ✓ ${result.secure_url}`);
  return result.secure_url;
}

async function main() {
  // Upload photos one by one
  const newPhotoUrls = [];
  for (const file of photoFiles) {
    try {
      const url = await uploadFile(file, 'hosts/wendi-simon');
      newPhotoUrls.push(url);
    } catch (err) {
      console.error(`  ✗ Failed: ${file}`, err.message);
    }
  }

  // Upload video
  let videoUrl = null;
  try {
    videoUrl = await uploadFile(videoFile, 'hosts/wendi-simon', 'video');
  } catch (err) {
    console.error('  ✗ Video upload failed:', err.message);
  }

  console.log(`\nUploaded ${newPhotoUrls.length} photos, video: ${videoUrl ? 'yes' : 'no'}`);

  // Update DB
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Get current lifestylePhotoUrls
  const [rows] = await conn.execute('SELECT lifestylePhotoUrls FROM host_listings WHERE id = ?', [LISTING_ID]);
  const current = rows[0]?.lifestylePhotoUrls || [];
  const existing = Array.isArray(current) ? current : JSON.parse(current);
  const merged = [...existing, ...newPhotoUrls];

  await conn.execute(
    'UPDATE host_listings SET lifestylePhotoUrls = ? WHERE id = ?',
    [JSON.stringify(merged), LISTING_ID]
  );
  console.log(`Updated lifestylePhotoUrls: now ${merged.length} photos`);

  // Set intro video if uploaded
  if (videoUrl) {
    await conn.execute(
      'UPDATE host_listings SET introVideoUrl = ? WHERE id = ?',
      [videoUrl, LISTING_ID]
    );
    console.log(`Set introVideoUrl: ${videoUrl}`);
  }

  await conn.end();
  console.log('\nDone!');
}

main().catch(console.error);
