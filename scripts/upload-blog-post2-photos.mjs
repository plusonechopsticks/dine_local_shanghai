import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photos = [
  { file: '/home/ubuntu/upload/1f928dcf457a3be17c7c2e00f0b881e9.jpg', publicId: 'blog/post2-ethan-jiading-ayi' },
  { file: '/home/ubuntu/upload/photo-output.jpeg', publicId: 'blog/post2-ekaterina-katina-jiading-ayi' },
  { file: '/home/ubuntu/upload/IMG_1348.jpeg', publicId: 'blog/post2-danil-katerina-full-table' },
];

for (const photo of photos) {
  try {
    console.log(`Uploading ${photo.publicId}...`);
    const result = await cloudinary.uploader.upload(photo.file, {
      public_id: photo.publicId,
      overwrite: true,
      resource_type: 'image',
    });
    console.log(`✓ ${photo.publicId}: ${result.secure_url}`);
  } catch (err) {
    console.error(`✗ ${photo.publicId}: ${err.message}`);
  }
}
console.log('Done!');
