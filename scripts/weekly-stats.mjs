import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  `SELECT b.id, b.guestName, DATE_FORMAT(b.requestedDate, '%Y-%m-%d') as date, b.numberOfGuests, b.totalAmount, b.bookingStatus, h.hostName
   FROM bookings b
   LEFT JOIN host_listings h ON b.hostListingId = h.id
   WHERE b.paymentStatus = 'paid'
   AND b.guestName NOT LIKE '%test%' AND b.guestName NOT LIKE '%Test%'
   AND b.guestName NOT IN ('Shugen test', 'Shugenbaba', 'Remy test', 'Sophie', "Sophie's Friend", 'Garrett', "Garrett's Friend")
   AND b.bookingStatus != 'cancelled'
   AND b.requestedDate >= '2026-03-01'
   ORDER BY b.requestedDate ASC`
);

// Group by week (Monday-based)
const weeks = new Map();
for (const r of rows) {
  const d = new Date(r.date + 'T00:00:00Z');
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  const weekKey = monday.toISOString().slice(0, 10);
  if (!weeks.has(weekKey)) weeks.set(weekKey, { bookings: 0, guests: 0, revenue: 0, names: [] });
  const w = weeks.get(weekKey);
  w.bookings++;
  w.guests += r.numberOfGuests || 0;
  w.revenue += parseFloat(r.totalAmount || 0);
  w.names.push(`${r.guestName} (${r.hostName})`);
}

// Print all weeks from Mar 2 to now, marking empty ones
const start = new Date('2026-03-02T00:00:00Z');
const end = new Date('2026-07-14T00:00:00Z');
let cur = new Date(start);
let totalBookings = 0, totalGuests = 0, totalRevenue = 0, weeksWithBookings = 0;

console.log('Week (Mon)   | Bookings | Guests | Revenue | Details');
console.log('-------------|----------|--------|---------|--------');
while (cur <= end) {
  const key = cur.toISOString().slice(0, 10);
  const w = weeks.get(key);
  if (w) {
    console.log(`${key} |    ${w.bookings}     |   ${w.guests}    | ¥${w.revenue.toFixed(0).padStart(5)} | ${w.names.join(', ')}`);
    totalBookings += w.bookings;
    totalGuests += w.guests;
    totalRevenue += w.revenue;
    weeksWithBookings++;
  } else {
    console.log(`${key} |    —     |   —    |    —    | (no bookings)`);
  }
  cur.setUTCDate(cur.getUTCDate() + 7);
}

// Future bookings
console.log('');
console.log('--- UPCOMING ---');
for (const [key, w] of weeks) {
  if (key > '2026-07-14') {
    console.log(`${key} |    ${w.bookings}     |   ${w.guests}    | ¥${w.revenue.toFixed(0).padStart(5)} | ${w.names.join(', ')}`);
    totalBookings += w.bookings;
    totalGuests += w.guests;
    totalRevenue += w.revenue;
    weeksWithBookings++;
  }
}

console.log('');
console.log('=== SUMMARY ===');
console.log(`Weeks with bookings: ${weeksWithBookings}`);
console.log(`Total bookings: ${totalBookings}`);
console.log(`Total guests: ${totalGuests}`);
console.log(`Total revenue: ¥${totalRevenue.toFixed(0)}`);
console.log(`Avg guests per booking: ${(totalGuests / totalBookings).toFixed(1)}`);

await conn.end();
