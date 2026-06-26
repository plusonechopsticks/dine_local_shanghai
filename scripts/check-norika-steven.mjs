import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  "SELECT id, hostName, latitude, longitude, district, status FROM host_listings WHERE hostName LIKE '%Norika%' OR hostName LIKE '%Steven%'"
);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
