import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { conversations, messages } from "../drizzle/schema";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[1]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "dine_local",
});

const db = drizzle(pool);

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
  const result = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, hostListingId),
        eq(messages.isRead, false)
      )
    );
  return result.length;
}
