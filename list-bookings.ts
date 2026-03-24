import { getDb } from "./server/db.ts";
import { bookings } from "./drizzle/schema.ts";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect");
    process.exit(1);
  }

  const allBookings = await db.select().from(bookings);
  console.log(`Total bookings: ${allBookings.length}`);
  
  allBookings.slice(0, 5).forEach((b, i) => {
    console.log(
      `${i + 1}. ID: ${b.id}, Guest: ${b.guestName}, Status: ${b.paymentStatus}, Date: ${b.experienceDate}`
    );
  });

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
