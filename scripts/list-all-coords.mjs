import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  "SELECT id, hostName, status, latitude, longitude, district FROM host_listings ORDER BY id ASC"
);

console.log('\n=== All Host Listings — Map Coordinates ===\n');
console.log(String('ID').padEnd(8) + String('Host Name').padEnd(30) + String('Status').padEnd(12) + String('Latitude').padEnd(12) + String('Longitude').padEnd(12) + 'District');
console.log('-'.repeat(90));

for (const row of rows) {
  const hasCoords = row.latitude && row.longitude ? '✓' : '✗ MISSING';
  console.log(
    String(row.id).padEnd(8) +
    String(row.hostName).padEnd(30) +
    String(row.status).padEnd(12) +
    String(row.latitude ?? 'NULL').padEnd(12) +
    String(row.longitude ?? 'NULL').padEnd(12) +
    String(row.district ?? '')
  );
}

await conn.end();
