import { db } from "./server/db";
import { hostListings } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const hosts = await db.select({ id: hostListings.id, name: hostListings.hostName })
    .from(hostListings)
    .where(eq(hostListings.isActive, true));
  console.log(JSON.stringify(hosts, null, 2));
  process.exit(0);
}
main().catch(console.error);
