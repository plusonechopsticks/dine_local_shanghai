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
  '/home/ubuntu/upload/chengdu_melody-duke_01.jpg',
  '/home/ubuntu/upload/chengdu_melody-duke_02.jpg',
  '/home/ubuntu/upload/chengdu_melody-duke_03.jpg',
  '/home/ubuntu/upload/chengdu_melody-duke_04.jpg',
  '/home/ubuntu/upload/chengdu_melody-duke_05.jpg',
];

console.log('Uploading food photos...');
const photoUrls = [];
for (let i = 0; i < photos.length; i++) {
  const r = await cloudinary.uploader.upload(photos[i], {
    folder: 'host-food-photos',
    public_id: `melody-duke-food-${i + 1}`,
    overwrite: true,
  });
  photoUrls.push(r.secure_url);
  console.log(`Photo ${i + 1}: ${r.secure_url}`);
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const bio = `After many years studying and living abroad, I've come to believe food is the best bridge between cultures. My husband Duke and I would love to welcome you into our home for a relaxed dinner — handmade dumplings, slow-simmered soup, and conversation that goes wherever it wants to go.

More than a meal, we hope it feels like an evening with local friends. We're happy to swap travel stories or talk about everyday life in China — and if you're curious about tech, you're at the right table: we both started our careers as product managers, and Duke now works in AI. Ask him anything; dinner may run long.`;

const menuDescription = `Handmade dumplings, folded fresh that day — guests are welcome to join the folding · Clay-pot pork rib and white radish soup, slow-simmered · Two or three Sichuan home dishes (recent tables: pepper chicken with fresh green chilies, sesame-glazed sweet ribs, tofu-skin salad in chili oil) · Melody's home baking to finish — her orange chiffon cake is the house specialty`;

const whyHost = `I've visited more than twenty countries and spent years living overseas. Those years taught me that the best way to understand a place is through its food and its everyday life — which is exactly the Chengdu we want to share with you.`;

const otherPassions = `Baking, travel, cybersecurity, AI and tech, product management, cultural exchange`;

const overseasExperience = `Lived abroad for many years, visited 20+ countries`;

await conn.execute(
  `INSERT INTO host_listings
    (id, hostName, title, bio, cuisineStyle, district, pricePerPerson, maxGuests, minGuests,
     menuDescription, languages, overseasExperience, whyHost, otherPassions, mealDurationMinutes,
     kidsFriendly, hasPets, foodPhotoUrls, availability, status, isNewHost, email, wechatOrPhone)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    520003,
    'Melody & Duke',
    'Handmade Dumplings & Sichuan Home Cooking',
    bio,
    'Sichuan Home Cooking & Handmade Dumplings',
    'Tianfu New Area, Chengdu',
    340,
    4,
    1,
    menuDescription,
    JSON.stringify(['English', 'Mandarin']),
    overseasExperience,
    whyHost,
    otherPassions,
    120,
    true,
    false,
    JSON.stringify(photoUrls),
    JSON.stringify({ lunch: true, dinner: true, daysOfWeek: [0,1,2,3,4,5,6] }),
    'approved',
    true,
    '18610483469@163.com',
    '18610483469',
  ]
);

console.log('Melody & Duke listing inserted with ID 520003');
await conn.end();
