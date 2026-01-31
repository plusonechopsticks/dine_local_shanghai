import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, date } from "drizzle-orm/mysql-core";

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
  
  // Contact
  email: varchar("email", { length: 320 }).notNull(),
  wechatOrPhone: varchar("wechatOrPhone", { length: 100 }).notNull(),
  
  // Location
  district: varchar("district", { length: 100 }).notNull(),
  fullAddress: text("fullAddress"), // Only filled after approval
  
  // Availability - stored as JSON for flexibility
  // e.g., { "monday": ["lunch", "dinner"], "saturday": ["dinner"] }
  availability: json("availability").$type<Record<string, string[]>>().notNull(),
  
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
