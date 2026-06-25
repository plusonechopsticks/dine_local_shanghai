import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile photo
const profilePhoto = {
  file: '/home/ubuntu/upload/58.jpg',
  publicId: 'hosts/wendi-simon/profile-couple-dinner',
};

// Food photos (all except 58.jpg which is profile)
const foodPhotos = [
  { file: '/home/ubuntu/upload/55.jpg', publicId: 'hosts/wendi-simon/food-spread-overhead' },
  { file: '/home/ubuntu/upload/56.jpg', publicId: 'hosts/wendi-simon/food-chicken-tofu-bowl' },
  { file: '/home/ubuntu/upload/57.jpg', publicId: 'hosts/wendi-simon/food-tomato-egg-braised-beef' },
  { file: '/home/ubuntu/upload/59.jpg', publicId: 'hosts/wendi-simon/food-noodles-ribs-nachos' },
  { file: '/home/ubuntu/upload/60.jpg', publicId: 'hosts/wendi-simon/food-shrimp-soup-corn' },
  { file: '/home/ubuntu/upload/61.jpg', publicId: 'hosts/wendi-simon/food-glazed-chicken-wings' },
  { file: '/home/ubuntu/upload/62.jpg', publicId: 'hosts/wendi-simon/food-homestyle-spread' },
  { file: '/home/ubuntu/upload/54.jpg', publicId: 'hosts/wendi-simon/food-charcuterie-board' },
];

function cloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/${publicId}.jpg`;
}

async function uploadPhoto(photo) {
  console.log(`Uploading ${photo.publicId}...`);
  await cloudinary.uploader.upload(photo.file, {
    public_id: photo.publicId,
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1600, crop: 'limit' }],
  });
  const url = cloudinaryUrl(photo.publicId);
  console.log(`  -> ${url}`);
  return url;
}

const bio = "We're Wendi and Simon, a Shanghai-based couple with a serious case of wanderlust. Wendi volunteered as a teacher in Africa at 18, went on to get her Master's degree in the UK, and spent years exploring most of Europe from there. Since then she's kept the passport busy — Peru, Russia, Azerbaijan, Laos, and more. She's currently learning Spanish to make her way back to South America. Simon was a dedicated solo traveller before marriage — the kind of person who'd head to Universal Studios Osaka alone and have a great time doing it. Together we've since explored Australia, the US, Italy, Japan, South Korea, Vietnam, and beyond. We're open, curious, and love making friends wherever we go.";

const overseasExperience = "Between us we've covered a lot of ground — Europe, South America, Central Asia, Southeast Asia, East Asia, Oceania, and North America. Wendi's highlights include teaching in Africa, studying in the UK, and solo adventures to Peru, Russia, Azerbaijan, and Laos. Simon's solo travels took him across Asia before we started exploring together. We're the kind of people who travel to connect, not just to sightsee — and we're always up for a good conversation about the world.";

const whyHost = "We love making friends from all over the world and hearing how people see things differently — including how they see China. Open, judgment-free conversations are our favourite kind. We also feel strongly that too many international visitors have never tasted real Chinese home cooking (and no, Panda Express doesn't count!). Our apartment is spacious and we genuinely mean it when we say: come over, relax, and make yourself at home.";

const menuDescription = `Braised Pork Ribs — Slow-cooked ribs in a rich, savoury sauce, a proper Chinese home classic
Tomato & Egg Stir-fry — The ultimate comfort dish, silky eggs with sweet tomato and sesame
Dry-fried Green Beans with Pork — Blistered beans tossed with minced pork and aromatics
Braised Beef & Potato — Hearty chunks of beef slow-braised with potato and scallion
Edamame with Minced Pork — A light, protein-packed side dish
Celery & Tofu Skin Stir-fry — Crisp celery with chewy tofu skin in a light sauce
Shrimp & Vermicelli Soup — Whole prawns in a warming broth with glass noodles
Honey-glazed Chicken Wings — Oven-roasted wings with sesame glaze, sticky and caramelised
Spicy Braised Chicken with Leek — Tender chicken pieces braised with leek and chilli
Charcuterie & Cheese Board — Prosciutto, melon, brie, crackers and chocolate for a relaxed start
Fried Noodles with Sausage — Wok-tossed noodles with sliced Chinese sausage`;

// Availability: Mon-Sun, lunch and dinner
const availability = {
  monday: ['lunch', 'dinner'],
  tuesday: ['lunch', 'dinner'],
  wednesday: ['lunch', 'dinner'],
  thursday: ['lunch', 'dinner'],
  friday: ['lunch', 'dinner'],
  saturday: ['lunch', 'dinner'],
  sunday: ['lunch', 'dinner'],
};

async function main() {
  // 1. Upload profile photo
  const profileUrl = await uploadPhoto(profilePhoto);

  // 2. Upload food photos
  const foodUrls = [];
  for (const photo of foodPhotos) {
    const url = await uploadPhoto(photo);
    foodUrls.push(url);
  }

  // 3. Create listing in DB
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  const [result] = await conn.execute(
    `INSERT INTO host_listings 
      (hostName, profilePhotoUrl, languages, bio, overseasExperience, whyHost,
       email, wechatOrPhone, district, fullAddress,
       availability, maxGuests, minGuests, cuisineStyle, title,
       menuDescription, foodPhotoUrls, pricePerPerson,
       kidsFriendly, hasPets, householdFeatures,
       status, isNewHost, displayOrder,
       activities, viewCount, discountPercentage, mealDurationMinutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Wendi and Simon',
      profileUrl,
      JSON.stringify(['English', 'Mandarin']),
      bio,
      overseasExperience,
      whyHost,
      'wendi.simon@example.com',  // placeholder — update later
      '',                          // placeholder wechat
      'Songjiang',
      '500m from Line 9, Jiuting Station',
      JSON.stringify(availability),
      4,   // maxGuests
      1,   // minGuests
      'Chinese Home Cooking',
      'Real Chinese Home Cooking in Jiuting — No Panda Express Here',
      menuDescription,
      JSON.stringify(foodUrls),
      340, // pricePerPerson
      true,  // kidsFriendly
      false, // hasPets
      JSON.stringify([]),
      'approved',
      true,  // isNewHost
      0,     // displayOrder
      JSON.stringify([]),
      0,   // viewCount
      0,   // discountPercentage
      120, // mealDurationMinutes
    ]
  );

  const newId = result.insertId;
  console.log(`\nListing created with ID: ${newId}`);

  // 4. Block dates from today through July 15, 2026
  const startDate = new Date('2026-06-25');
  const endDate = new Date('2026-07-15');
  let current = new Date(startDate);
  let blockedCount = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    await conn.execute(
      `INSERT INTO host_availability_blocks (hostListingId, blockType, blockDate, mealType, reason)
       VALUES (?, 'date', ?, 'both', 'Not yet available — opening July 16')`,
      [newId, dateStr]
    );
    blockedCount++;
    current.setDate(current.getDate() + 1);
  }

  console.log(`Blocked ${blockedCount} dates (Jun 25 – Jul 15, 2026)`);

  // 5. Verify
  const [rows] = await conn.execute(
    'SELECT id, hostName, pricePerPerson, maxGuests, status, isNewHost FROM host_listings WHERE id = ?',
    [newId]
  );
  console.log('\nVerification:');
  console.log(JSON.stringify(rows[0], null, 2));

  await conn.end();
  console.log('\nDone!');
}

main().catch(console.error);
