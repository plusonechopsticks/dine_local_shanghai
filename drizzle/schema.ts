import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, date, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Interest submissions from landing page
 * Stores both traveler and host family interests
 */
export const interestSubmissions = mysqlTable("interest_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  interestType: mysqlEnum("interestType", ["traveler", "host"]).notNull(),
  message: text("message"),
  hidden: boolean("hidden").default(false), // Hide test submissions from admin view
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterestSubmission = typeof interestSubmissions.$inferSelect;
export type InsertInterestSubmission = typeof interestSubmissions.$inferInsert;

/**
 * Simplified host interest submissions for inaugural batch
 * Collects basic contact info before full application
 */
export const hostInterests = mysqlTable("host_interests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  contact: varchar("contact", { length: 255 }).notNull(), // Email or WeChat ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HostInterest = typeof hostInterests.$inferSelect;
export type InsertHostInterest = typeof hostInterests.$inferInsert;

/**
 * Host listings - detailed profiles for host families
 */
export const hostListings = mysqlTable("host_listings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Host Profile
  hostName: varchar("hostName", { length: 255 }).notNull(),
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 500 }), // Selfie
  languages: json("languages").$type<string[]>().notNull(), // e.g., ["English", "Mandarin"]
  bio: text("bio").notNull(),
  activities: json("activities").$type<string[]>().default([] as any).notNull(), // e.g., ["cooking-class", "park-visit", "shopping"]
  
  // Human-Centered Profile Fields
  overseasExperience: text("overseasExperience"), // Where they've lived/traveled abroad
  funFacts: text("funFacts"), // Personality quirks and interesting facts
  whyHost: text("whyHost"), // Their motivation for hosting
  culturalPassions: text("culturalPassions"), // What they love about Chinese culture beyond food
  otherPassions: text("otherPassions"), // Non-food passions and interests (from activities, otherNotes)
  
  // Contact
  email: varchar("email", { length: 320 }).notNull(),
  wechatOrPhone: varchar("wechatOrPhone", { length: 100 }).notNull(),
  
  // Location
  district: varchar("district", { length: 100 }).notNull(),
  fullAddress: text("fullAddress"), // Only filled after approval
  
  // Availability - stored as JSON for flexibility
  // e.g., { "monday": ["lunch", "dinner"], "saturday": ["dinner"] }
  availability: json("availability").$type<Record<string, string[]>>().notNull(),
  availabilityComments: text("availabilityComments"), // Host notes about unavailable dates (CNY, travel, etc.)
  
  // Dining Details
  maxGuests: int("maxGuests").notNull().default(2),
  cuisineStyle: varchar("cuisineStyle", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }), // AI-generated or custom title for the experience
  menuDescription: text("menuDescription").notNull(),
  foodPhotoUrls: json("foodPhotoUrls").$type<string[]>().notNull(), // At least 3 photos
  dietaryNote: text("dietaryNote"), // e.g., "Can accommodate vegetarian, vegan, gluten-free. Not suitable for shellfish allergy."
  mealDurationMinutes: int("mealDurationMinutes").notNull().default(120),
  pricePerPerson: int("pricePerPerson").notNull().default(100), // in RMB
  otherNotes: text("otherNotes"), // Additional notes about the experience
  
  // Household Info
  kidsFriendly: boolean("kidsFriendly").notNull().default(true),
  hasPets: boolean("hasPets").notNull().default(false),
  petDetails: varchar("petDetails", { length: 255 }), // e.g., "One friendly cat"
  householdFeatures: json("householdFeatures").$type<string[]>().default([] as any).notNull(), // e.g., ["has-pets", "has-stairs"]
  otherHouseholdInfo: text("otherHouseholdInfo"), // Additional household information
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  
  // Analytics
  viewCount: int("viewCount").notNull().default(0),
  
  // Promotions
  discountPercentage: int("discountPercentage").notNull().default(0), // 0-100, e.g., 25 for 25% off
  
  // Display Order (lower number = higher priority, 0 = default)
  displayOrder: int("displayOrder").notNull().default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HostListing = typeof hostListings.$inferSelect;
export type InsertHostListing = typeof hostListings.$inferInsert;

/**
 * Bookings - guest requests to dine with hosts
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Host and Guest
  hostListingId: int("hostListingId").notNull().references(() => hostListings.id),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 20 }),
  
  // Booking Details
  requestedDate: date("requestedDate").notNull(), // The date they want to dine
  mealType: mysqlEnum("mealType", ["lunch", "dinner"]).notNull(),
  numberOfGuests: int("numberOfGuests").notNull().default(1),
  specialRequests: text("specialRequests"), // Dietary restrictions, allergies, preferences
  
  // Status
  status: mysqlEnum("bookingStatus", ["pending", "confirmed", "cancelled", "rejected"]).default("pending").notNull(),
  hostNotes: text("hostNotes"), // Host's response/notes
  hidden: boolean("hidden").default(false), // Hide test bookings from admin view
  
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  paymentDate: timestamp("paymentDate"),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Conversations - chat threads between hosts and guests
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Participants
  hostListingId: int("hostListingId").notNull().references(() => hostListings.id),
  guestEmail: varchar("guestEmail", { length: 320 }).notNull(),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  
  // Related booking (optional - conversation can exist without confirmed booking)
  bookingId: int("bookingId").references(() => bookings.id),
  
  // Metadata
  subject: varchar("subject", { length: 255 }).notNull(), // e.g., "Booking for Feb 8"
  lastMessage: text("lastMessage"), // Preview of last message
  lastMessageAt: timestamp("lastMessageAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages - individual messages in a conversation
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Conversation reference
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  
  // Sender info
  senderType: mysqlEnum("senderType", ["host", "guest"]).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }).notNull(),
  
  // Message content
  content: text("content").notNull(),
  
  // Read status
  isRead: boolean("isRead").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Site announcements for Find Hosts page
 * Editable by admin to display important updates
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Chat sessions - visitor support conversations
 * Tracks each unique chat session with AI and admin support
 */
export const chatSessions = mysqlTable("chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Visitor info (optional - can be anonymous)
  visitorName: varchar("visitorName", { length: 255 }),
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  
  // Session metadata
  sessionId: varchar("sessionId", { length: 100 }).notNull().unique(), // UUID for tracking
  status: mysqlEnum("status", ["active", "needs_human", "resolved"]).default("active").notNull(),
  
  // Admin takeover
  adminTookOver: boolean("adminTookOver").default(false).notNull(),
  adminTookOverAt: timestamp("adminTookOverAt"),
  
  // Last activity
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat messages - individual messages in a chat session
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Session reference
  sessionId: int("sessionId").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  
  // Message details
  senderType: mysqlEnum("senderType", ["visitor", "ai", "admin"]).notNull(),
  content: text("content").notNull(),
  
  // Admin info (if sender is admin)
  adminName: varchar("adminName", { length: 255 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
