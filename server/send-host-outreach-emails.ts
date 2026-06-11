/**
 * Safety-net job: send outreach emails to host interest submissions that missed the auto-send.
 * Called daily by the scheduled endpoint /api/scheduled/send-host-outreach-emails.
 *
 * Logic:
 *  - Find all host interest submissions where outreachEmailSent = false
 *  - Send the outreach email and mark outreachEmailSent = true
 *  - Skip hidden entries
 */

import { getDb } from "./db";
import { hostInterests } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "./email";
import { generateHostInterestOutreachEmail } from "./email-templates";

export async function sendHostOutreachEmails(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find all unsent outreach emails (not hidden)
  const pending = await db
    .select({
      id: hostInterests.id,
      name: hostInterests.name,
      email: hostInterests.email,
    })
    .from(hostInterests)
    .where(
      and(
        eq(hostInterests.outreachEmailSent, false),
        eq(hostInterests.hidden, false)
      )
    );

  console.log(`[HostOutreach] Found ${pending.length} pending outreach email(s)`);

  let sent = 0;
  let errors = 0;

  for (const interest of pending) {
    try {
      await sendEmail({
        to: interest.email,
        subject: `Hosting with +1 Chopsticks — let's chat!`,
        html: generateHostInterestOutreachEmail({ name: interest.name }),
      });
      await db.update(hostInterests).set({ outreachEmailSent: true }).where(eq(hostInterests.id, interest.id));
      console.log(`[HostOutreach] Sent outreach email to ${interest.email} (id=${interest.id})`);
      sent++;
    } catch (err: any) {
      console.error(`[HostOutreach] Error sending to ${interest.email}:`, err);
      errors++;
    }
  }

  console.log(`[HostOutreach] Done: sent=${sent}, errors=${errors}`);
  return { sent, errors };
}
