import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { reviews, reviewTokens, bookings, hostListings } from "../drizzle/schema";
import type { InsertReview } from "../drizzle/schema";
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
  const existing = await db
    .select()
    .from(reviewTokens)
    .where(eq(reviewTokens.bookingId, bookingId))
    .limit(1);
  if (existing.length > 0) return existing[0].token;
  const token = generateReviewToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  await db.insert(reviewTokens).values({ bookingId, token, used: false, expiresAt });
  return token;
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

/** Submit a review */
export async function submitReview(data: InsertReview): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(reviews).values(data);
  return (result as any).insertId as number;
}

/** Get published reviews with host name, optionally filtered by hostListingId */
export async function getPublishedReviews(hostListingId?: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: reviews.id,
      bookingId: reviews.bookingId,
      hostListingId: reviews.hostListingId,
      hostName: hostListings.hostName,
      guestName: reviews.guestName,
      numberOfGuests: reviews.numberOfGuests,
      rating: reviews.rating,
      comment: reviews.comment,
      photoUrls: reviews.photoUrls,
      travellerCategory: reviews.travellerCategory,
      isPublished: reviews.isPublished,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(hostListings, eq(reviews.hostListingId, hostListings.id))
    .where(
      hostListingId
        ? and(eq(reviews.isPublished, true), eq(reviews.hostListingId, hostListingId))
        : eq(reviews.isPublished, true)
    )
    .orderBy(desc(reviews.createdAt));
  return rows;
}
