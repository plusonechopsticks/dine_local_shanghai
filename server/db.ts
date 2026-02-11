import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  interestSubmissions, 
  InsertInterestSubmission, 
  InterestSubmission,
  hostInterests,
  InsertHostInterest,
  HostInterest,
  hostListings,
  InsertHostListing,
  HostListing,
  bookings,
  Booking,
  chatSessions,
  chatMessages,
  ChatSession,
  InsertChatSession,
  ChatMessage,
  InsertChatMessage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Interest submission helpers
export async function createInterestSubmission(submission: InsertInterestSubmission): Promise<InterestSubmission | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create submission: database not available");
    return null;
  }

  try {
    await db.insert(interestSubmissions).values(submission);
    // Get the inserted record
    const result = await db
      .select()
      .from(interestSubmissions)
      .where(eq(interestSubmissions.email, submission.email))
      .orderBy(desc(interestSubmissions.createdAt))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create interest submission:", error);
    throw error;
  }
}

export async function getAllInterestSubmissions(): Promise<InterestSubmission[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get submissions: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(interestSubmissions)
      .orderBy(desc(interestSubmissions.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get interest submissions:", error);
    throw error;
  }
}

// Host interest helpers (simplified inaugural batch)
export async function createHostInterest(interest: InsertHostInterest): Promise<HostInterest | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create host interest: database not available");
    return null;
  }

  try {
    await db.insert(hostInterests).values(interest);
    // Get the inserted record
    const result = await db
      .select()
      .from(hostInterests)
      .where(eq(hostInterests.contact, interest.contact))
      .orderBy(desc(hostInterests.createdAt))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create host interest:", error);
    throw error;
  }
}

export async function getAllHostInterests(): Promise<HostInterest[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get host interests: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(hostInterests)
      .orderBy(desc(hostInterests.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get host interests:", error);
    throw error;
  }
}

// Host listing helpers
export async function createHostListing(listing: InsertHostListing): Promise<HostListing | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create host listing: database not available");
    return null;
  }

  try {
    await db.insert(hostListings).values(listing);
    // Get the inserted record
    const result = await db
      .select()
      .from(hostListings)
      .where(eq(hostListings.email, listing.email))
      .orderBy(desc(hostListings.createdAt))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create host listing:", error);
    throw error;
  }
}

export async function getHostListingById(id: number): Promise<HostListing | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get host listing: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(hostListings)
      .where(eq(hostListings.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get host listing:", error);
    throw error;
  }
}

export async function getAllHostListings(status?: "pending" | "approved" | "rejected"): Promise<HostListing[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get host listings: database not available");
    return [];
  }

  try {
    let result: HostListing[];
    if (status) {
      result = await db
        .select()
        .from(hostListings)
        .where(eq(hostListings.status, status))
        .orderBy(desc(hostListings.createdAt));
    } else {
      result = await db
        .select()
        .from(hostListings)
        .orderBy(desc(hostListings.createdAt));
    }
    console.log(`[Database] getAllHostListings: Found ${result.length} listings`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get host listings:", error);
    throw error;
  }
}

export async function updateHostListingStatus(
  id: number, 
  status: "pending" | "approved" | "rejected",
  adminNotes?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update host listing: database not available");
    return false;
  }

  try {
    await db
      .update(hostListings)
      .set({ status, adminNotes: adminNotes || null })
      .where(eq(hostListings.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update host listing status:", error);
    throw error;
  }
}

export async function updateHostListing(
  id: number,
  data: Partial<InsertHostListing>
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update host listing: database not available");
    return false;
  }

  try {
    await db
      .update(hostListings)
      .set(data)
      .where(eq(hostListings.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update host listing:", error);
    throw error;
  }
}

// Booking helpers
export async function getAllBookings(): Promise<(Booking & { hostName?: string })[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bookings: database not available");
    return [];
  }

  try {
    // Get all bookings with their related host information
    const result = await db
      .select({
        id: bookings.id,
        hostListingId: bookings.hostListingId,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        guestPhone: bookings.guestPhone,
        requestedDate: bookings.requestedDate,
        mealType: bookings.mealType,
        numberOfGuests: bookings.numberOfGuests,
        specialRequests: bookings.specialRequests,
        status: bookings.status,
        hostNotes: bookings.hostNotes,
        hidden: bookings.hidden,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        paymentDate: bookings.paymentDate,
        stripeSessionId: bookings.stripeSessionId,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        hostName: hostListings.hostName,
      })
      .from(bookings)
      .leftJoin(hostListings, eq(bookings.hostListingId, hostListings.id))
      .orderBy(desc(bookings.createdAt));
    
    return result as (Booking & { hostName?: string })[];
  } catch (error) {
    console.error("[Database] Failed to get bookings:", error);
    throw error;
  }
}

/**
 * Chat Support Functions
 */

export async function createChatSession(session: InsertChatSession): Promise<ChatSession> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(chatSessions).values(session);
  
  // Get the created session
  const result = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, session.sessionId));
  return result[0];
}

export async function getChatSessionBySessionId(sessionId: string): Promise<ChatSession | null> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
  return result[0] || null;
}

export async function getAllChatSessions(): Promise<ChatSession[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db.select().from(chatSessions).orderBy(desc(chatSessions.lastMessageAt));
  return result;
}

export async function updateChatSessionStatus(sessionId: string, status: "active" | "needs_human" | "resolved", adminTookOver?: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const updateData: any = { status };
  if (adminTookOver !== undefined) {
    updateData.adminTookOver = adminTookOver;
    if (adminTookOver) {
      updateData.adminTookOverAt = new Date();
    }
  }
  
  await db.update(chatSessions)
    .set(updateData)
    .where(eq(chatSessions.sessionId, sessionId));
}

export async function createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(chatMessages).values(message);
  
  // Update session's lastMessageAt
  await db.update(chatSessions)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatSessions.id, message.sessionId));
  
  // Get the created message
  const result = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
  let messageId;
  if (Array.isArray(result) && result.length > 0) {
    const firstRow: any = result[0];
    if (Array.isArray(firstRow) && firstRow.length > 0) {
      messageId = firstRow[0]?.id || firstRow[0]?.['LAST_INSERT_ID()'];
    } else {
      messageId = firstRow?.id || firstRow?.['LAST_INSERT_ID()'];
    }
  }
  
  const messages = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId));
  return messages[0];
}

export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
  return result;
}
