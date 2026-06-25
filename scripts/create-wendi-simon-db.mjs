import mysql from 'mysql2/promise';

const BASE = 'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600';

const profileUrl = `${BASE}/hosts/wendi-simon/profile-couple-dinner.jpg`;

const foodUrls = [
  `${BASE}/hosts/wendi-simon/food-55.jpg`,
  `${BASE}/hosts/wendi-simon/food-56.jpg`,
  `${BASE}/hosts/wendi-simon/food-57.jpg`,
  `${BASE}/hosts/wendi-simon/food-59.jpg`,
  `${BASE}/hosts/wendi-simon/food-60.jpg`,
  `${BASE}/hosts/wendi-simon/food-61.jpg`,
  `${BASE}/hosts/wendi-simon/food-62.jpg`,
  `${BASE}/hosts/wendi-simon/food-54.jpg`,
];

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
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Create listing
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
      '',  // email placeholder
      '',  // wechat placeholder
      'Songjiang',
      '500m from Line 9, Jiuting Station',
      JSON.stringify(availability),
      4,   // maxGuests
      1,   // minGuests
      'Chinese Home Cooking',
      'Real Chinese Home Cooking in Jiuting — No Panda Express Here',
      menuDescription,
      JSON.stringify(foodUrls),
      340,
      true,
      false,
      JSON.stringify([]),
      'approved',
      true,  // isNewHost
      0,
      JSON.stringify([]),
      0,
      0,
      120,
    ]
  );

  const newId = result.insertId;
  console.log(`Listing created with ID: ${newId}`);

  // Block dates Jun 25 – Jul 15, 2026
  const startDate = new Date('2026-06-25');
  const endDate = new Date('2026-07-15');
  let current = new Date(startDate);
  let count = 0;

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    await conn.execute(
      `INSERT INTO host_availability_blocks (hostListingId, blockType, blockDate, mealType, reason)
       VALUES (?, 'date', ?, 'both', 'Not yet available — opening July 16')`,
      [newId, dateStr]
    );
    count++;
    current.setDate(current.getDate() + 1);
  }

  console.log(`Blocked ${count} dates (Jun 25 – Jul 15)`);

  // Verify
  const [rows] = await conn.execute(
    'SELECT id, hostName, pricePerPerson, maxGuests, status, isNewHost, district FROM host_listings WHERE id = ?',
    [newId]
  );
  console.log('Verified:', JSON.stringify(rows[0], null, 2));

  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
