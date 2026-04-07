const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  const desc = '<p>Join us for a seasonal spring lunch timed around <strong>谷雨 (Grain Rain)</strong>, one of China\'s 24 solar terms \u2014 a time when the earth awakens and spring produce is at its peak.</p><p>Your host is <strong>Jiading Ayi</strong>, a true daughter of Jiading Old Town \u2014 birthplace of Shanghai\'s famous xiaolongbao. She grows her own vegetables in her backyard and cooks entirely from scratch.</p><p>Expect a <strong>seasonal spring lunch from her garden</strong>: tender bamboo shoots, spring greens, hand-picked herbs, and dishes that celebrate the fleeting flavors of the season.</p><p><strong>Optional:</strong> After lunch, take a stroll through Jiading\'s ancient gardens \u2014 stunning in spring!</p><p>Small group of 6 max. Intimate, seasonal, unforgettable.</p>';

  // Insert April 18 event (0 guests, 6 seats)
  await conn.execute(
    `INSERT INTO events (hostListingId, title, theme, description, eventDate, mealType, totalSeats, seatsRemaining, pricePerPerson, originalPrice, discountLabel, isFeatured, isPublished) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [150001, '\u8C37\u96E8 Grain Rain: \u5403\u6625 \u2014 Eating Spring', '\u5403\u6625 \u2014 Eating Spring | One of China\'s 24 Solar Terms', desc, '2026-04-18', 'lunch', 6, 6, 276, 368, '25% OFF', true, true]
  );
  console.log('Event 1 (Apr 18) inserted');

  // Insert April 19 event (4 guests taken, 2 remaining)
  await conn.execute(
    `INSERT INTO events (hostListingId, title, theme, description, eventDate, mealType, totalSeats, seatsRemaining, pricePerPerson, originalPrice, discountLabel, isFeatured, isPublished) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [150001, '\u8C37\u96E8 Grain Rain: \u5403\u6625 \u2014 Eating Spring', '\u5403\u6625 \u2014 Eating Spring | One of China\'s 24 Solar Terms', desc, '2026-04-19', 'lunch', 6, 2, 276, 368, '25% OFF', true, true]
  );
  console.log('Event 2 (Apr 19) inserted');

  // Get event IDs
  const [rows] = await conn.execute('SELECT id, eventDate FROM events ORDER BY id DESC LIMIT 2');
  console.log('Events:', rows);

  // Find Apr 19 event ID
  let apr19Id = null;
  for (const r of rows) {
    const d = r.eventDate instanceof Date ? r.eventDate.toISOString() : String(r.eventDate);
    if (d.includes('2026-04-19')) {
      apr19Id = r.id;
      break;
    }
  }

  if (apr19Id) {
    // Also check bookings column names
    const [bcols] = await conn.execute('DESCRIBE bookings');
    const colNames = bcols.map(c => c.Field);
    console.log('Booking columns:', colNames.join(', '));

    const influencers = [
      { name: 'Sophie', email: 'sophie@influencer.com' },
      { name: "Sophie's Friend", email: 'sophie.friend@influencer.com' },
      { name: 'Garrett', email: 'garrett@influencer.com' },
      { name: "Garrett's Friend", email: 'garrett.friend@influencer.com' },
    ];

    for (const inf of influencers) {
      await conn.execute(
        `INSERT INTO bookings (hostListingId, eventId, guestName, guestEmail, requestedDate, mealType, numberOfGuests, bookingStatus, paymentStatus, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [150001, apr19Id, inf.name, inf.email, '2026-04-19', 'lunch', 1, 'confirmed', 'paid', '276.00']
      );
      console.log('Booked:', inf.name);
    }
  } else {
    console.log('Could not find Apr 19 event');
  }

  await conn.end();
  console.log('Done!');
})();
