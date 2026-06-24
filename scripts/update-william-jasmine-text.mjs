import mysql from 'mysql2/promise';

const bio = "We're William and Jasmine, a global-minded couple living in Shanghai. William is in the tech space running a TikTok Live agency, while Jasmine works in finance handling Investor Relations for a USD fund. We are super easygoing, love hosting, and can't wait to hang out like old friends.";

const whyHost = "Why we host: We honestly just love throwing home parties! Back when we were studying in the US, local families showed us so much warmth and hospitality, and we really want to keep that tradition alive by paying it forward here. What we cook: A mix of Cantonese and Northern Chinese classics, along with some delicious Southeast Asian flavors we've picked up along the way. If you're down for it, we'd love for you to jump in the kitchen and cook with us! Topics to chat about: Anything from global travel and media trends to startup life, or our favorite local spots around town.";

const overseasExperience = "Travel is a massive part of our lives. William has been to over 30 countries across every continent except Antarctica, and Jasmine has extensive experience working and connecting with people globally. We love experiencing new cultures and know exactly how to make international travelers feel right at home.";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [result] = await conn.execute(
    'UPDATE host_listings SET bio = ?, whyHost = ?, overseasExperience = ? WHERE id = 420001',
    [bio, whyHost, overseasExperience]
  );
  
  console.log('Update result:', result);
  
  // Verify
  const [rows] = await conn.execute(
    'SELECT id, hostName, bio, whyHost, overseasExperience FROM host_listings WHERE id = 420001'
  );
  console.log('\nVerification:');
  console.log(JSON.stringify(rows, null, 2));
  
  await conn.end();
}

main().catch(console.error);
