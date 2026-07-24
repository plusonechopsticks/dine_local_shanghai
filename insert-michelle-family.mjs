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

const photos = [
  '/home/ubuntu/upload/chengdu_michelle_01.jpg',
  '/home/ubuntu/upload/chengdu_michelle_02.jpg',
  '/home/ubuntu/upload/chengdu_michelle_03.jpg',
  '/home/ubuntu/upload/chengdu_michelle_04.jpg',
  '/home/ubuntu/upload/chengdu_michelle_05.jpg',
];

console.log('Uploading food photos...');
const photoUrls = [];
for (let i = 0; i < photos.length; i++) {
  const r = await cloudinary.uploader.upload(photos[i], {
    folder: 'host-food-photos',
    public_id: `michelle-family-food-${i + 1}`,
    overwrite: true,
  });
  photoUrls.push(r.secure_url);
  console.log(`Photo ${i + 1}: ${r.secure_url}`);
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const bio = `Come have hotpot with a real Chengdu family — all four of us. Dad, Mom, and our two daughters will be around the table with you, cooking, chatting, and making sure you never fish an empty chopstick out of the pot. Hotpot is how Chengdu families celebrate, catch up, and welcome guests, and we can't think of a better way to show you our city.

If you join us for lunch and the afternoon is free, we'd love to take a walk with you at Nanhu Park nearby — a favorite weekend spot for local families.`;

const menuDescription = `Family hotpot, done properly: double broth (rich spicy beef-tallow + mild tomato) · hand-cut beef, lamb rolls, tripe, mushrooms, tofu, seasonal greens, glass noodles · the family dipping-sauce station — everyone builds their own · home-baked cookies to finish, made by the sisters`;

const whyHost = `Mom is the traveler of the family — Dubai, Fiji, Singapore, Malaysia, Thailand, and counting. Together we've road-tripped half of China, north to south and east to west. We know what it feels like to be guests in someone else's country, and we want you to feel like family in ours.`;

const otherPassions = `Family travel, road trips across China, baking, Italian language (elder sister)`;

const overseasExperience = `Mom has visited Dubai, Fiji, Singapore, Malaysia, Thailand and more`;

await conn.execute(
  `INSERT INTO host_listings
    (id, hostName, title, bio, cuisineStyle, district, pricePerPerson, maxGuests, minGuests,
     menuDescription, languages, overseasExperience, whyHost, otherPassions, mealDurationMinutes,
     kidsFriendly, hasPets, foodPhotoUrls, availability, status, isNewHost, email, wechatOrPhone)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    530003,
    "Michelle's Family",
    'Family Hotpot',
    bio,
    'Sichuan Hotpot & Home Cooking',
    'Shuangliu District, Chengdu',
    340,
    4,
    1,
    menuDescription,
    JSON.stringify(['Mandarin', 'English']),
    overseasExperience,
    whyHost,
    otherPassions,
    120,
    true,
    false,
    JSON.stringify(photoUrls),
    JSON.stringify({ lunch: true, dinner: true, daysOfWeek: [0] }), // Sundays preferred
    'approved',
    true,
    '18610483469@163.com',
    '18610483469',
  ]
);

console.log("Michelle's Family listing inserted with ID 530003");
await conn.end();
