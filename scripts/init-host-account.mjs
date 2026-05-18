/**
 * One-time script: initialize a host account for Steven & Norika
 * Usage: node scripts/init-host-account.mjs
 */
import { createRequire } from "module";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Load env
import { config } from "dotenv";
config();

// We need to call the TypeScript service functions, so we use tsx
// Run this via: npx tsx scripts/init-host-account.mjs
import { initializeHostAccount } from "../server/hostAuth.ts";

const HOST_LISTING_ID = 1;
const HOST_EMAIL = "globe.stevento@gmail.com";

console.log(`Initializing host account for listingId=${HOST_LISTING_ID}, email=${HOST_EMAIL}...`);

try {
  const result = await initializeHostAccount(HOST_LISTING_ID, HOST_EMAIL);
  if (result.success) {
    console.log("✅ Host account created successfully. Welcome email sent.");
    console.log("   Account:", result.account);
  } else {
    console.error("❌ Failed:", result.error);
  }
} catch (err) {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
}

process.exit(0);
