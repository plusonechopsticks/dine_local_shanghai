/**
 * One-time script: Reset all existing host account passwords to foodie@plus1chopsticks
 * Run with: node scripts/reset-host-passwords.mjs
 */
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const NEW_PASSWORD = "foodie@plus1chopsticks";
const SALT_ROUNDS = 10;

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("Connected to database.");

  // Fetch all host accounts
  const [rows] = await db.execute("SELECT id, hostListingId, email FROM host_accounts");
  console.log(`Found ${rows.length} host account(s).`);

  if (rows.length === 0) {
    console.log("No accounts to update.");
    await db.end();
    return;
  }

  const newHash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);
  console.log("New password hash generated.");

  for (const row of rows) {
    await db.execute(
      "UPDATE host_accounts SET passwordHash = ? WHERE hostListingId = ?",
      [newHash, row.hostListingId]
    );
    console.log(`  ✓ Reset password for host ${row.email} (listingId: ${row.hostListingId})`);
  }

  console.log(`\nDone. All ${rows.length} host account(s) now use the new password.`);
  await db.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
