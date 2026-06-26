import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Activity photo filenames that should be in lifestylePhotoUrls, not foodPhotoUrls
const activityFilenames = [
  'william-horse-riding.jpg',
  'jasmine-winter-hiking.jpg',
  'jasmine-fishing.jpg',
];

const [rows] = await conn.execute(
  'SELECT foodPhotoUrls, lifestylePhotoUrls FROM host_listings WHERE id = 420001'
);

const row = rows[0];
const foodPhotos = Array.isArray(row.foodPhotoUrls)
  ? row.foodPhotoUrls
  : JSON.parse(row.foodPhotoUrls || '[]');

const existingLifestyle = Array.isArray(row.lifestylePhotoUrls)
  ? row.lifestylePhotoUrls
  : JSON.parse(row.lifestylePhotoUrls || '[]');

// Separate food from activity
const newFoodPhotos = foodPhotos.filter(url => {
  const filename = url.split('/').pop().split('?')[0];
  return !activityFilenames.includes(filename);
});

const movedPhotos = foodPhotos.filter(url => {
  const filename = url.split('/').pop().split('?')[0];
  return activityFilenames.includes(filename);
});

// Merge moved photos into lifestyle (avoid duplicates)
const existingUrls = new Set(existingLifestyle.map(u => u.split('/').pop().split('?')[0]));
const newLifestylePhotos = [
  ...existingLifestyle,
  ...movedPhotos.filter(url => !existingUrls.has(url.split('/').pop().split('?')[0]))
];

console.log(`Food photos: ${foodPhotos.length} → ${newFoodPhotos.length}`);
console.log(`Lifestyle photos: ${existingLifestyle.length} → ${newLifestylePhotos.length}`);
console.log('Moved to lifestyle:', movedPhotos.map(u => u.split('/').pop()));

await conn.execute(
  'UPDATE host_listings SET foodPhotoUrls = ?, lifestylePhotoUrls = ? WHERE id = 420001',
  [JSON.stringify(newFoodPhotos), JSON.stringify(newLifestylePhotos)]
);

console.log('Done.');
await conn.end();
