import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Use ID 510003 (confirmed from previous run)
const newId = 510003;

const availability = JSON.stringify({
  monday: ['lunch', 'dinner'],
  tuesday: ['lunch', 'dinner'],
  wednesday: ['lunch', 'dinner'],
  thursday: ['lunch', 'dinner'],
  friday: ['lunch', 'dinner'],
  saturday: ['lunch', 'dinner'],
  sunday: ['lunch', 'dinner'],
});

const foodPhotoUrls = JSON.stringify([
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1784820883/host-photos/xirui-food-1.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1784820883/host-photos/xirui-food-2.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1784820886/host-photos/xirui-food-3.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1784820897/host-photos/xirui-food-4.jpg',
  'https://res.cloudinary.com/drxfcfayd/image/upload/v1784820883/host-photos/xirui-food-5.jpg',
]);

const languages = JSON.stringify(['English', 'Mandarin']);

const bio = `I grew up in Northeast China, spent twelve years in Beijing, and now call Chengdu home — which means my kitchen tells the story of half of China. One night you might get hearty Dongbei comfort food; the next, proper Sichuan heat. Most tables in Chengdu can only give you one of those. I'd love to give you both.

Over dinner, let's talk about daily life in China, food culture, and where you've been. And before you leave, I'll happily map out my favorite corners of Chengdu — the snack streets, the teahouses, the panda base, and the neighborhood spots no guidebook has found yet.`;

const menuDescription = `A home-style spread of four to five dishes, rotating with the seasons and the morning market:

• Guo bao rou (锅包肉) — crispy sweet-and-sour pork, the pride of the Northeast
• Twice-cooked pork (回锅肉) — the Sichuan classic
• Braised pork ribs with potatoes and green beans, Dongbei style
• Mapo tofu or kung pao chicken
• Seasonal greens and rice

Spice level fully adjustable — from Chengdu-fierce to gently aromatic.`;

await conn.execute(
  `INSERT INTO host_listings
    (id, hostName, title, bio, cuisineStyle, district, pricePerPerson, maxGuests, minGuests,
     menuDescription, languages, overseasExperience, whyHost, otherPassions, mealDurationMinutes,
     kidsFriendly, hasPets, foodPhotoUrls, availability, status, isNewHost, email, wechatOrPhone)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    String(newId),
    'Xirui (Siri)',
    'Northeast Meets Sichuan — Two Cuisines, One Table in Chengdu',
    bio,
    'Northern & Sichuan Home Cooking',
    'Gaoxin District, Chengdu',
    340,
    4,
    1,
    menuDescription,
    languages,
    'Traveled across China from the far northeast to the southwest, and abroad to Japan, Thailand, and beyond.',
    "Traveling taught me what a seat at a local table means to a visitor far from home — that's exactly what I want to offer at mine.",
    "Hiking, brewing pour-over coffee, wandering local wet markets looking for whatever's freshest.",
    120,
    1,
    0,
    foodPhotoUrls,
    availability,
    'approved',
    1,
    'xirui@plus1chopsticks.com',
    'TBC',
  ]
);

console.log('✅ Xirui host listing inserted with ID:', newId);
await conn.end();
