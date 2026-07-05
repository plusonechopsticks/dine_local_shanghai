import * as dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Echo Ren (ID 210001) — block all of July 2026
const echoId = 210001;
const julyDates = [];
for (let d = 1; d <= 31; d++) {
  julyDates.push(`2026-07-${String(d).padStart(2, '0')}`);
}

// Eating/Yiting (ID 360001) — block Jul 5 and Jul 11
const eatingId = 360001;
const eatingDates = ['2026-07-05', '2026-07-11'];

// Insert Echo's July blocks
console.log(`Blocking all of July 2026 for Echo Ren (ID ${echoId})...`);
for (const date of julyDates) {
  await conn.query(
    `INSERT INTO host_availability_blocks (hostListingId, blockType, blockDate, mealType, reason) VALUES (?, 'date', ?, 'both', 'Host unavailable')`,
    [echoId, date]
  );
}
console.log(`✓ Blocked ${julyDates.length} dates for Echo Ren`);

// Insert Eating/Yiting's blocks
console.log(`Blocking Jul 5 & Jul 11 for Eating/Yiting (ID ${eatingId})...`);
for (const date of eatingDates) {
  await conn.query(
    `INSERT INTO host_availability_blocks (hostListingId, blockType, blockDate, mealType, reason) VALUES (?, 'date', ?, 'both', 'Host unavailable')`,
    [eatingId, date]
  );
}
console.log(`✓ Blocked ${eatingDates.length} dates for Eating/Yiting`);

await conn.end();
console.log('\nDone!');
