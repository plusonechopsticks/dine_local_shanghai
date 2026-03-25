/**
 * One-time CSV import script for Railway DB migration.
 *
 * Usage:
 *   1. Place your exported CSVs in ./csv-export/ (filenames = table names, e.g. host_listings.csv)
 *   2. Set DATABASE_URL to the Railway connection string
 *   3. Run: DATABASE_URL="mysql://..." pnpm tsx import-from-csv.ts
 *
 * The script:
 *   - Disables FK checks so tables can be loaded in any order
 *   - Preserves all original IDs
 *   - Skips tables whose CSV file is not found
 */

import * as fs from "fs";
import * as path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const CSV_DIR = process.env.CSV_DIR || "./csv-export";

// Import order respects FK dependencies (parents before children)
const TABLE_ORDER = [
  "users",
  "interest_submissions",
  "host_interests",
  "announcements",
  "blog_posts",
  "host_listings",
  "host_accounts",
  "bookings",
  "host_availability_blocks",
  "conversations",
  "page_views",
  "messages",
  "chat_sessions",
  "chat_messages",
  "blog_post_views",
];

// ---------------------------------------------------------------------------
// CSV parser – handles quoted fields and embedded commas/newlines
// ---------------------------------------------------------------------------
function parseCsv(content: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let pos = 0;
  const len = content.length;

  function parseField(): string {
    if (pos < len && content[pos] === '"') {
      // Quoted field
      pos++; // skip opening quote
      let value = "";
      while (pos < len) {
        if (content[pos] === '"') {
          if (pos + 1 < len && content[pos + 1] === '"') {
            // Escaped quote
            value += '"';
            pos += 2;
          } else {
            pos++; // skip closing quote
            break;
          }
        } else {
          value += content[pos++];
        }
      }
      return value;
    } else {
      // Unquoted field — read until comma or newline
      let value = "";
      while (pos < len && content[pos] !== "," && content[pos] !== "\n" && content[pos] !== "\r") {
        value += content[pos++];
      }
      return value;
    }
  }

  function parseLine(): string[] | null {
    // Skip \r\n or \n
    while (pos < len && (content[pos] === "\r" || content[pos] === "\n")) pos++;
    if (pos >= len) return null;

    const fields: string[] = [];
    while (pos < len && content[pos] !== "\n" && content[pos] !== "\r") {
      fields.push(parseField());
      if (pos < len && content[pos] === ",") pos++; // skip comma
    }
    return fields;
  }

  // First line = headers
  const headers = parseLine();
  if (!headers) return rows;

  let line: string[] | null;
  while ((line = parseLine()) !== null) {
    if (line.length === 0 || (line.length === 1 && line[0] === "")) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = line![i] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Value coercion – turn CSV strings into MySQL-safe values
// ---------------------------------------------------------------------------
function coerce(value: string): string | number | boolean | null {
  // Empty string or \N = NULL
  if (value === "" || value === "\\N" || value === "NULL") return null;

  // Booleans stored as 0/1
  if (value === "0") return 0;
  if (value === "1") return 1;

  return value;
}

// ---------------------------------------------------------------------------
// Main import function
// ---------------------------------------------------------------------------
async function importTable(
  conn: mysql.Connection,
  table: string
): Promise<void> {
  const filePath = path.join(CSV_DIR, `${table}.csv`);

  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] ${table}.csv not found`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCsv(content);

  if (rows.length === 0) {
    console.log(`  [SKIP] ${table}.csv is empty`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(", ");
  const columnList = columns.map((c) => `\`${c}\``).join(", ");
  const sql = `INSERT IGNORE INTO \`${table}\` (${columnList}) VALUES (${placeholders})`;

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const values = columns.map((col) => coerce(row[col]));
    try {
      const [result] = await conn.execute<mysql.ResultSetHeader>(sql, values);
      if (result.affectedRows > 0) inserted++;
      else skipped++;
    } catch (err: any) {
      console.error(`  [ERROR] row in ${table}:`, err.message);
      console.error("  values:", values);
    }
  }

  console.log(
    `  [OK]   ${table}: ${inserted} inserted, ${skipped} skipped (duplicates)`
  );
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL is not set.");
    console.error(
      'Run as: DATABASE_URL="mysql://user:pass@host:3306/dbname" pnpm tsx import-from-csv.ts'
    );
    process.exit(1);
  }

  if (!fs.existsSync(CSV_DIR)) {
    console.error(`ERROR: CSV directory not found: ${CSV_DIR}`);
    console.error("Create the directory and place your .csv files inside.");
    process.exit(1);
  }

  console.log(`Connecting to Railway DB...`);
  const conn = await mysql.createConnection(dbUrl);
  console.log("Connected.\n");

  try {
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
    console.log("FK checks disabled. Importing tables...\n");

    for (const table of TABLE_ORDER) {
      await importTable(conn, table);
    }

    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("\nFK checks re-enabled.");
    console.log("\nImport complete!");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
