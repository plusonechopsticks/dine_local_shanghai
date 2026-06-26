import mysql from 'mysql2/promise';

// All coordinates — DB is now the single source of truth
const coords = [
  { id: 1,      lat: '31.1661', lng: '121.2195' }, // Norika & Steven — Qingpu (百联奥特莱斯)
  { id: 90002,  lat: '31.1893', lng: '121.4350' }, // Grace — Xuhui (Xujiahui area)
  { id: 150001, lat: '31.3756', lng: '121.2654' }, // Jiading Ayi — Jiading district
  { id: 180001, lat: '31.1953', lng: '121.4267' }, // Chuan — Xuhui (Jiaotong Uni area)
  { id: 210001, lat: '31.2280', lng: '121.5520' }, // Echo — Pudong (Yushan Rd area)
  { id: 240001, lat: '31.2400', lng: '121.3900' }, // Sookie — Putuo district-level
  { id: 330001, lat: '22.5431', lng: '114.0579' }, // Filbert — Longhua, Shenzhen
  { id: 360001, lat: '31.2050', lng: '121.3680' }, // Eating (Yiting) — Gubei, Changning
  { id: 390001, lat: '30.5723', lng: '104.0665' }, // Dragon — Wuhou, Chengdu
  { id: 420001, lat: '31.2567', lng: '121.4204' }, // William & Jasmine — Putuo
  { id: 480002, lat: '31.1394', lng: '121.3140' }, // Wendi & Simon — Jiuting Station, Songjiang
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const { id, lat, lng } of coords) {
  const [result] = await conn.execute(
    'UPDATE host_listings SET latitude = ?, longitude = ? WHERE id = ?',
    [lat, lng, id]
  );
  console.log(`ID ${id}: updated to ${lat}, ${lng} (${result.affectedRows} row)`);
}

console.log('\nAll coordinates migrated to database.');
await conn.end();
