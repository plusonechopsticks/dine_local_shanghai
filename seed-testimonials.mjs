import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seedTestimonials() {
  // Parse DATABASE_URL
  const url = new URL(DATABASE_URL);
  const config = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  const pool = mysql.createPool({
    ...config,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Inserting En Kai's guest testimonial...");

    // Find Chuan's host listing ID
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT id FROM host_listings WHERE hostName LIKE '%Chuan%' LIMIT 1"
    );

    if (!rows || rows.length === 0) {
      console.error("Chuan's host listing not found");
      connection.release();
      process.exit(1);
    }

    const chuanId = rows[0].id;
    console.log(`Found Chuan's listing ID: ${chuanId}`);

    // Prepare images JSON
    const images = JSON.stringify([
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/lXOwzpqWCsNJoaDj.jpg",
        alt: "En Kai with Chuan and friend at dining table",
        type: "guest",
        caption: "En Kai with Chuan and her friend",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/EvimBVDaXjaWAemo.jpg",
        alt: "Black Bean Tomato Stir-fried Water Spinach",
        type: "food",
        caption: "豆豉番茄炒空心菜",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/sZUsgCgrwiqhzkDX.jpg",
        alt: "Guava with Sour Plum Powder",
        type: "food",
        caption: "奶油苦乐配酸梅粉",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/prSHUQvgfGONScyJ.jpg",
        alt: "Radish Soup with Beef Brisket",
        type: "food",
        caption: "萝卜清汤啤",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/AWdkGNvAjVFQxzwu.jpg",
        alt: "Pickled Greens with Pork Belly",
        type: "food",
        caption: "酸菜炒五花肉",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/tWZLlCUzbZjWbxuj.jpg",
        alt: "Chinese Chives with Snail Meat",
        type: "food",
        caption: "非菜炒螺蛳肉",
      },
      {
        url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/fIhxSlrejJGXUyCj.jpg",
        alt: "Pickled Lettuce Stem",
        type: "food",
        caption: "莴笋醋",
      },
    ]);

    const tags = JSON.stringify([
      "authentic",
      "welcoming",
      "solo-traveler",
      "food",
    ]);

    // Insert testimonial
    await connection.execute(
      `INSERT INTO guest_testimonials (
        guestName, guestLocation, travelerType, hostListingId, experienceDate,
        type, title, subtitle, attributionLine, previewText, \`fullText\`,
        additionalText, tertiaryText, images, badge, tags, ctaLabel, ctaUrl,
        featured, displayOrder, published, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        "En Kai",
        "Singapore",
        "Solo Traveler",
        chuanId,
        "2026-03-22",
        "direct_review",
        "Solo traveler experience",
        "Dining with hosts at a cozy home table",
        "From En Kai, Singapore, Solo Traveler",
        "It was a very interesting experience and everything went well! I enjoyed the conversations and the cozy vibe. It felt like going to a friend's house and just hanging out. It also gave me a glimpse of how locals live their everyday lives, which is what I enjoy most during all my travels.",
        "It was a very interesting experience and everything went well! I enjoyed the conversations and the cozy vibe. It felt like going to a friend's house and just hanging out. It also gave me a glimpse of how locals live their everyday lives, which is what I enjoy most during all my travels. Good food with good vibes and definitely one of the highlights of my trip.",
        "For feedback, the process was pretty smooth but it must be very taxing for you to maintain such prompt email correspondence. So thanks for accommodating and coordinating with such a tight schedule!",
        "All in all, I enjoyed the experience and hope to see this platform succeed because meal logistics can be quite challenging as a solo traveller. It also gives an authentic local experience which I really cherish and hope to pay it forward after receiving such kind gestures from you, Chuan and her friend! So it will be awesome if the platform succeed!",
        images,
        "Real guest experience",
        tags,
        "Book your own experience",
        "/hosts",
        1, // featured
        1, // displayOrder
        1, // published
      ]
    );

    console.log("✅ En Kai's testimonial inserted successfully!");
    console.log(`
Testimonial Details:
- Guest: En Kai (Singapore, Solo Traveler)
- Host: Chuan (ID: ${chuanId})
- Experience Date: March 22, 2026
- Images: 7 (1 guest + 6 food photos)
- Featured: Yes
- Published: Yes
    `);

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Error inserting testimonial:", error);
    process.exit(1);
  }
}

seedTestimonials();
