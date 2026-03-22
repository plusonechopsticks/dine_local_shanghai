import { getDb } from "./server/db.ts";
import { bookings } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect");
    process.exit(1);
  }

  const paidBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.paymentStatus, "completed"));

  console.log(`Found ${paidBookings.length} paid bookings:`);
  paidBookings.slice(0, 5).forEach((b, i) => {
    console.log(
      `${i + 1}. ID: ${b.id}, Guest: ${b.guestName}, Host: ${b.hostName}, Date: ${b.experienceDate}`
    );
  });

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
