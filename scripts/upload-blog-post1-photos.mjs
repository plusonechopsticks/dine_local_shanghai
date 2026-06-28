import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photos = [
  { file: '/home/ubuntu/upload/IMG_1335.jpeg', publicId: 'blog/post1-solo-travelers/hero-home-cooked-spread' },
  { file: '/home/ubuntu/upload/5da864cd90e402e7715ba980f18321.jpg', publicId: 'blog/post1-solo-travelers/momo-chuan-table' },
  { file: '/home/ubuntu/upload/4e6861c31a171b08ff392a37ce93c170.jpg', publicId: 'blog/post1-solo-travelers/enkai-chuan-table' },
  { file: '/home/ubuntu/upload/7105945890900b94ee18fb30c1b2570c.jpg', publicId: 'blog/post1-solo-travelers/dustin-grace-selfie' },
];

for (const photo of photos) {
  console.log(`Uploading ${path.basename(photo.file)}...`);
  try {
    const result = await cloudinary.uploader.upload(photo.file, {
      public_id: photo.publicId,
      overwrite: true,
      resource_type: 'image',
    });
    console.log(`✓ ${photo.publicId}`);
    console.log(`  URL: ${result.secure_url}`);
  } catch (err) {
    console.error(`✗ Failed: ${err.message}`);
  }
}

console.log('\nAll uploads done.');
