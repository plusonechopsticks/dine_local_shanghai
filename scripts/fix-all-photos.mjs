import mysql from 'mysql2/promise';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getCloudinaryUrl(publicId, resourceType = 'image') {
  // Generate a clean URL without transformation params
  return cloudinary.url(publicId, { secure: true, resource_type: resourceType });
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // ===== FIX WILLIAM & JASMINE (420001) =====
  // The comma-split bug: q_auto,f_auto,w_1600 was split into separate array items
  // Reconstruct the correct 7 URLs
  const wjFoodPhotos = [
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-dinner-spread.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-beef-tomato-soup.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-table-flowers.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/food-shrimp-chicken-spread.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/william-horse-riding.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/jasmine-winter-hiking.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/q_auto,f_auto,w_1600/hosts/william-jasmine/jasmine-fishing.jpg',
  ];

  await conn.execute(
    'UPDATE host_listings SET foodPhotoUrls = ? WHERE id = 420001',
    [JSON.stringify(wjFoodPhotos)]
  );
  console.log('✓ Fixed William & Jasmine food photos:', wjFoodPhotos.length, 'photos');

  // ===== FIX WENDI & SIMON (480002) =====
  // Verify the food photo URLs are actually accessible - check via Cloudinary API
  // The URLs without version numbers should still work if the public_id is correct
  // Let's verify by listing what's in the wendi-simon folder
  console.log('\nChecking Wendi & Simon Cloudinary assets...');
  
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'hosts/wendi-simon/food',
      max_results: 50,
    });
    
    const foodUrls = result.resources.map(r => r.secure_url);
    console.log('Found', foodUrls.length, 'food photos in Cloudinary:');
    foodUrls.forEach(u => console.log(' ', u));
    
    if (foodUrls.length > 0) {
      await conn.execute(
        'UPDATE host_listings SET foodPhotoUrls = ? WHERE id = 480002',
        [JSON.stringify(foodUrls)]
      );
      console.log('✓ Updated Wendi & Simon food photos with verified Cloudinary URLs');
    }
  } catch (err) {
    console.error('Cloudinary API error:', err.message);
    // Fallback: use the existing URLs but ensure they have proper format
    const wsFoodPhotos = [
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-55.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-56.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-57.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-59.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-60.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-61.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-62.jpg',
      'https://res.cloudinary.com/drxfcfayd/image/upload/hosts/wendi-simon/food-54.jpg',
    ];
    await conn.execute(
      'UPDATE host_listings SET foodPhotoUrls = ? WHERE id = 480002',
      [JSON.stringify(wsFoodPhotos)]
    );
    console.log('✓ Updated Wendi & Simon food photos (fallback)');
  }

  await conn.end();
  console.log('\nAll done!');
}

main().catch(console.error);
