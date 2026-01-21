import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

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
 * Host listings - detailed profiles for host families
 */
export const hostListings = mysqlTable("host_listings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Host Profile
  hostName: varchar("hostName", { length: 255 }).notNull(),
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 500 }),
  languages: json("languages").$type<string[]>().notNull(), // e.g., ["English", "Mandarin"]
  bio: text("bio").notNull(),
  
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
  menuDescription: text("menuDescription").notNull(),
  foodPhotoUrls: json("foodPhotoUrls").$type<string[]>().notNull(), // At least 3 photos
  dietaryAccommodations: json("dietaryAccommodations").$type<string[]>(), // e.g., ["vegetarian", "halal"]
  mealDurationMinutes: int("mealDurationMinutes").notNull().default(120),
  pricePerPerson: int("pricePerPerson").notNull().default(100), // in RMB
  
  // Household Info
  kidsFriendly: boolean("kidsFriendly").notNull().default(true),
  hasPets: boolean("hasPets").notNull().default(false),
  petDetails: varchar("petDetails", { length: 255 }), // e.g., "One friendly cat"
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HostListing = typeof hostListings.$inferSelect;
export type InsertHostListing = typeof hostListings.$inferInsert;
