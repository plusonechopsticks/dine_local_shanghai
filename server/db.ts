import { eq, and, desc, sql } from "drizzle-orm";
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
  InsertChatMessage,
  pageViews,
  PageView,
  InsertPageView,
  hostAccounts,
  HostAccount,
  InsertHostAccount,
  hostAvailabilityBlocks,
  HostAvailabilityBlock,
  InsertHostAvailabilityBlock,
  blogPosts,
  BlogPost,
  InsertBlogPost,
  blogPostViews,
  BlogPostView,
  InsertBlogPostView
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
    console.log(`[Database] Updating host listing ${id} with data:`, JSON.stringify(data, null, 2));
    await db
      .update(hostListings)
      .set(data)
      .where(eq(hostListings.id, id));
    console.log(`[Database] Successfully updated host listing ${id}`);
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

// Page view analytics helpers
export async function trackPageView(pageType: "home" | "browse_hosts" | "become_host" | "host_detail", hostListingId?: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track page view: database not available");
    return;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if a record exists for today
    const existing = await db
      .select()
      .from(pageViews)
      .where(
        sql`${pageViews.pageType} = ${pageType} AND DATE(${pageViews.viewDate}) = DATE(${today}) ${hostListingId ? sql`AND ${pageViews.hostListingId} = ${hostListingId}` : sql`AND ${pageViews.hostListingId} IS NULL`}`
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Increment existing record
      await db
        .update(pageViews)
        .set({ viewCount: sql`${pageViews.viewCount} + 1` })
        .where(eq(pageViews.id, existing[0].id));
    } else {
      // Create new record
      await db.insert(pageViews).values({
        pageType,
        hostListingId: hostListingId || null,
        viewDate: today,
        viewCount: 1,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to track page view:", error);
  }
}

export async function getPageViewsAnalytics(days: number = 30): Promise<PageView[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get page views: database not available");
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const result = await db
      .select()
      .from(pageViews)
      .where(sql`${pageViews.viewDate} >= ${startDate}`)
      .orderBy(desc(pageViews.viewDate));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get page views analytics:", error);
    return [];
  }
}

export async function getPageViewsByType(pageType: "home" | "browse_hosts" | "become_host" | "host_detail", days: number = 30): Promise<PageView[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get page views: database not available");
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const result = await db
      .select()
      .from(pageViews)
      .where(sql`${pageViews.pageType} = ${pageType} AND ${pageViews.viewDate} >= ${startDate}`)
      .orderBy(desc(pageViews.viewDate));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get page views by type:", error);
    return [];
  }
}


// Host Authentication Functions
export async function getHostAccountByEmail(email: string): Promise<HostAccount | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(hostAccounts)
      .where(eq(hostAccounts.email, email))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get host account:", error);
    return null;
  }
}

export async function getHostAccountByListingId(hostListingId: number): Promise<HostAccount | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(hostAccounts)
      .where(eq(hostAccounts.hostListingId, hostListingId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get host account by listing:", error);
    return null;
  }
}

export async function createHostAccount(account: InsertHostAccount): Promise<HostAccount | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(hostAccounts).values(account);
    return getHostAccountByEmail(account.email);
  } catch (error) {
    console.error("[Database] Failed to create host account:", error);
    return null;
  }
}

export async function updateHostAccountPassword(hostListingId: number, passwordHash: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(hostAccounts)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(hostAccounts.hostListingId, hostListingId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update host password:", error);
    return false;
  }
}

export async function updateHostLastLogin(hostListingId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(hostAccounts)
      .set({ lastLoginAt: new Date() })
      .where(eq(hostAccounts.hostListingId, hostListingId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update last login:", error);
    return false;
  }
}

// Host Availability Functions
export async function getHostAvailabilityBlocks(hostListingId: number): Promise<HostAvailabilityBlock[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(hostAvailabilityBlocks)
      .where(eq(hostAvailabilityBlocks.hostListingId, hostListingId));
  } catch (error) {
    console.error("[Database] Failed to get availability blocks:", error);
    return [];
  }
}

export async function createAvailabilityBlock(block: InsertHostAvailabilityBlock): Promise<HostAvailabilityBlock | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(hostAvailabilityBlocks).values(block);
    const blocks = await getHostAvailabilityBlocks(block.hostListingId);
    return blocks[blocks.length - 1] || null;
  } catch (error) {
    console.error("[Database] Failed to create availability block:", error);
    return null;
  }
}

export async function deleteAvailabilityBlock(blockId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .delete(hostAvailabilityBlocks)
      .where(eq(hostAvailabilityBlocks.id, blockId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete availability block:", error);
    return false;
  }
}


/**
 * Availability Checking Functions
 */

export async function isHostAvailable(
  hostListingId: number,
  requestedDate: string,
  mealType: "lunch" | "dinner"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check availability: database not available");
    return true; // Allow booking if DB is unavailable
  }

  try {
    // Get the day of week (0 = Monday, 6 = Sunday)
    const date = new Date(requestedDate);
    const dayOfWeek = (date.getUTCDay() + 6) % 7; // Convert to Monday=0, Sunday=6

    // Check for blocks on this specific date
    const requestedDateObj = new Date(requestedDate);
    const dateBlocks = await db
      .select()
      .from(hostAvailabilityBlocks)
      .where(
        and(
          eq(hostAvailabilityBlocks.hostListingId, hostListingId),
          eq(hostAvailabilityBlocks.blockType, "date"),
          eq(hostAvailabilityBlocks.blockDate, requestedDateObj)
        )
      );

    // Check if any date block affects this meal
    for (const block of dateBlocks) {
      if (block.mealType === "both" || block.mealType === mealType) {
        return false;
      }
    }

    // Check for weekday blocks
    const weekdayBlocks = await db
      .select()
      .from(hostAvailabilityBlocks)
      .where(
        and(
          eq(hostAvailabilityBlocks.hostListingId, hostListingId),
          eq(hostAvailabilityBlocks.blockType, "weekday"),
          eq(hostAvailabilityBlocks.blockWeekday, dayOfWeek)
        )
      );

    // Check if any weekday block affects this meal
    for (const block of weekdayBlocks) {
      if (block.mealType === "both" || block.mealType === mealType) {
        return false;
      }
    }

    // Check for all_day blocks
    const allDayBlocks = await db
      .select()
      .from(hostAvailabilityBlocks)
      .where(
        and(
          eq(hostAvailabilityBlocks.hostListingId, hostListingId),
          eq(hostAvailabilityBlocks.blockType, "all_day")
        )
      );

    // If there's an all_day block, host is unavailable
    if (allDayBlocks.length > 0) {
      return false;
    }

    return true; // Host is available
  } catch (error) {
    console.error("[Database] Failed to check availability:", error);
    return true; // Allow booking if there's an error
  }
}

export async function getHostAvailableSlots(
  hostListingId: number,
  startDate: string,
  endDate: string
): Promise<{
  date: string;
  lunch: boolean;
  dinner: boolean;
}[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get available slots: database not available");
    return [];
  }

  try {
    const slots: { date: string; lunch: boolean; dinner: boolean }[] = [];
    
    // Generate all dates in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      
      // Check availability for lunch and dinner
      const lunchAvailable = await isHostAvailable(hostListingId, dateStr, "lunch");
      const dinnerAvailable = await isHostAvailable(hostListingId, dateStr, "dinner");
      
      slots.push({
        date: dateStr,
        lunch: lunchAvailable,
        dinner: dinnerAvailable,
      });
    }
    
    return slots;
  } catch (error) {
    console.error("[Database] Failed to get available slots:", error);
    return [];
  }
}
