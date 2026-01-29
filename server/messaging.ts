import { eq, desc, and } from "drizzle-orm";
import { conversations, messages } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create or get a conversation between host and guest
 */
export async function getOrCreateConversation(
  hostListingId: number,
  guestEmail: string,
  guestName: string,
  bookingId?: number,
  subject?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Check if conversation already exists
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.hostListingId, hostListingId),
        eq(conversations.guestEmail, guestEmail)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conversation
  const result = await db.insert(conversations).values({
    hostListingId,
    guestEmail,
    guestName,
    bookingId,
    subject: subject || `Dinner inquiry from ${guestName}`,
  });

  return {
    id: (result as any).insertId as number,
    hostListingId,
    guestEmail,
    guestName,
    bookingId,
    subject: subject || `Dinner inquiry from ${guestName}`,
    lastMessage: null,
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: number,
  senderType: "host" | "guest",
  senderName: string,
  senderEmail: string,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Insert message
  const result = await db.insert(messages).values({
    conversationId,
    senderType,
    senderName,
    senderEmail,
    content,
  });

  // Update conversation's last message
  await db
    .update(conversations)
    .set({
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  return {
    id: (result as any).insertId as number,
    conversationId,
    senderType,
    senderName,
    senderEmail,
    content,
    isRead: false,
    createdAt: new Date(),
  };
}

/**
 * Get all messages in a conversation
 */
export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

/**
 * Get all conversations for a host
 */
export async function getHostConversations(hostListingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.hostListingId, hostListingId))
    .orderBy(desc(conversations.lastMessageAt));
}

/**
 * Get all conversations for a guest
 */
export async function getGuestConversations(guestEmail: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.guestEmail, guestEmail))
    .orderBy(desc(conversations.lastMessageAt));
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  return await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false)
      )
    );
}

/**
 * Get unread message count for a host
 */
export async function getHostUnreadCount(hostListingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const result = await db
    .select()
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      and(
        eq(conversations.hostListingId, hostListingId),
        eq(messages.isRead, false)
      )
    );
  return result.length;
}
