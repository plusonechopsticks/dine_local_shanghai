import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
await conn.execute(
  "UPDATE host_listings SET latitude = '31.0350', longitude = '121.3950' WHERE id = 1"
);
console.log('Updated Norika & Steven coordinates to Qingpu: 31.0350, 121.3950');
await conn.end();
