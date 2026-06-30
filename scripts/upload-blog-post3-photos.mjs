import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photos = [
  { file: '/home/ubuntu/upload/a85279c7ef42090ceb02f3b5d2d2bdf0.jpg', publicId: 'blog/post3-sandrine-wonton' },
  { file: '/home/ubuntu/upload/photo-output.jpeg', publicId: 'blog/post3-danny-jiading-ayi' },
  { file: '/home/ubuntu/upload/IMG_1708.jpeg', publicId: 'blog/post3-pyke-norika-steven' },
];

for (const photo of photos) {
  console.log(`Uploading ${photo.publicId}...`);
  const result = await cloudinary.uploader.upload(photo.file, {
    public_id: photo.publicId,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`✓ ${photo.publicId}: ${result.secure_url}`);
}

console.log('All photos uploaded!');
