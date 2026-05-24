import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { reviews, reviewTokens, bookings } from "../drizzle/schema";
import type { InsertReview, InsertReviewToken } from "../drizzle/schema";
import crypto from "crypto";

/** Generate a secure random token */
export function generateReviewToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Derive traveller category from guest count */
export function getTravellerCategory(numberOfGuests: number): "solo" | "friends_couples" | "families" {
  if (numberOfGuests === 1) return "solo";
  if (numberOfGuests === 2) return "friends_couples";
  return "families";
}

/** Create a review token for a booking (expires in 30 days) */
export async function createReviewToken(bookingId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if token already exists for this booking
  const existing = await db
    .select()
    .from(reviewTokens)
    .where(eq(reviewTokens.bookingId, bookingId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].token;
  }

  const token = generateReviewToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await db.insert(reviewTokens).values({
    bookingId,
    token,
    used: false,
    expiresAt,
  });

  return token;
}

/** Get booking info from a review token */
export async function getBookingByReviewToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      token: reviewTokens.token,
      used: reviewTokens.used,
      expiresAt: reviewTokens.expiresAt,
      bookingId: reviewTokens.bookingId,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      numberOfGuests: bookings.numberOfGuests,
      hostListingId: bookings.hostListingId,
      requestedDate: bookings.requestedDate,
      mealType: bookings.mealType,
      bookingStatus: bookings.bookingStatus,
    })
    .from(reviewTokens)
    .innerJoin(bookings, eq(reviewTokens.bookingId, bookings.id))
    .where(eq(reviewTokens.token, token))
    .limit(1);

  return result[0] ?? null;
}

/** Check if a review already exists for a booking */
export async function getReviewByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId))
    .limit(1);

  return result[0] ?? null;
}

/** Submit a review and mark the token as used */
export async function submitReview(data: InsertReview, token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(reviews).values(data);
  const reviewId = (result as any).insertId as number;

  // Mark token as used
  await db
    .update(reviewTokens)
    .set({ used: true })
    .where(eq(reviewTokens.token, token));

  return reviewId;
}

/** Get all published reviews, optionally filtered by hostListingId */
export async function getPublishedReviews(hostListingId?: number) {
  const db = await getDb();
  if (!db) return [];

  const query = db
    .select()
    .from(reviews)
    .where(eq(reviews.isPublished, true));

  return query;
}
