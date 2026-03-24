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
  introVideoUrl: varchar("introVideoUrl", { length: 500 }), // Host introductory video URL
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
  bookingStatus: mysqlEnum("bookingStatus", ["pending", "confirmed", "cancelled", "rejected"]).default("pending").notNull(),
  hostNotes: text("hostNotes"), // Host's response/notes
  hidden: boolean("hidden").default(false), // Hide test bookings from admin view
  
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  paymentDate: timestamp("paymentDate"),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  
  // Reminders
  reminderEmailSent: boolean("reminderEmailSent").default(false), // Track if 48-hour reminder was sent
  
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

/**
 * Page views - track daily traffic for analytics
 * Records page views for key pages and host profiles
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  
  // Page information
  pageType: mysqlEnum("pageType", ["home", "browse_hosts", "become_host", "host_detail"]).notNull(),
  hostListingId: int("hostListingId").references(() => hostListings.id, { onDelete: "cascade" }), // Only for host_detail pages
  
  // Date (stored as DATE for grouping by day)
  viewDate: date("viewDate").notNull(),
  
  // View count for that day
  viewCount: int("viewCount").notNull().default(1),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;


/**
 * Host authentication - simple login system for hosts
 * Each host has one account linked to their listing
 */
export const hostAccounts = mysqlTable("host_accounts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Link to host listing (one-to-one)
  hostListingId: int("hostListingId").notNull().unique().references(() => hostListings.id, { onDelete: "cascade" }),
  
  // Authentication
  email: varchar("email", { length: 320 }).notNull().unique(), // Same as host profile email
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(), // Hashed password
  
  // Session
  lastLoginAt: timestamp("lastLoginAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HostAccount = typeof hostAccounts.$inferSelect;
export type InsertHostAccount = typeof hostAccounts.$inferInsert;

/**
 * Host availability blocking - manage unavailable dates and times
 * Stores blocked dates, specific weekdays, and meal times
 */
export const hostAvailabilityBlocks = mysqlTable("host_availability_blocks", {
  id: int("id").autoincrement().primaryKey(),
  
  // Link to host listing
  hostListingId: int("hostListingId").notNull().references(() => hostListings.id, { onDelete: "cascade" }),
  
  // Block type
  blockType: mysqlEnum("blockType", ["date", "weekday", "all_day"]).notNull(), // date: specific date, weekday: recurring day, all_day: block entire day
  
  // Block details
  blockDate: date("blockDate"), // For date-specific blocks
  blockWeekday: int("blockWeekday"), // 0-6 for Monday-Sunday (for recurring weekday blocks)
  mealType: mysqlEnum("mealType", ["lunch", "dinner", "both"]).default("both").notNull(), // Which meal(s) to block
  reason: varchar("reason", { length: 255 }), // e.g., "Family vacation", "Personal commitment"
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HostAvailabilityBlock = typeof hostAvailabilityBlocks.$inferSelect;
export type InsertHostAvailabilityBlock = typeof hostAvailabilityBlocks.$inferInsert;


/**
 * Blog posts - articles about travel, food, culture, and entrepreneurship
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Content
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(), // URL-friendly identifier
  excerpt: text("excerpt").notNull(), // Short summary for listings
  content: text("content").notNull(), // Full HTML content
  
  // Metadata
  authorName: varchar("authorName", { length: 255 }).notNull().default("Dai Bin"),
  featuredImageUrl: varchar("featuredImageUrl", { length: 500 }), // Hero image for blog post
  
  // Categorization
  tags: json("tags").$type<string[]>().notNull(), // e.g., ["entrepreneurship", "travel-policy", "food-culture"]
  
  // SEO
  metaDescription: text("metaDescription"), // For search results
  metaKeywords: varchar("metaKeywords", { length: 500 }), // For search engines
  
  // Status
  published: boolean("published").default(false), // Draft or published
  publishedAt: timestamp("publishedAt"), // When the post was published
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Blog post views - track analytics for blog posts
 */
export const blogPostViews = mysqlTable("blog_post_views", {
  id: varchar("id", { length: 255 }).primaryKey(),
  
  // Link to blog post
  blogPostId: varchar("blogPostId", { length: 255 }).notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  
  // View tracking
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: timestamp("lastViewedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPostView = typeof blogPostViews.$inferSelect;
export type InsertBlogPostView = typeof blogPostViews.$inferInsert;

/**
 * Guest testimonials - reviews and stories from guests after their dining experience
 * Supports photo carousels, truncated previews, and full modal reviews
 */
export const guestTestimonials = mysqlTable("guest_testimonials", {
  id: int("id").autoincrement().primaryKey(),
  
  // Guest Information
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestLocation: varchar("guestLocation", { length: 255 }).notNull(), // e.g., "Singapore"
  travelerType: varchar("travelerType", { length: 100 }).notNull(), // e.g., "Solo Traveler", "Couple", "Family"
  
  // Host Reference
  hostListingId: int("hostListingId").notNull().references(() => hostListings.id, { onDelete: "cascade" }),
  experienceDate: date("experienceDate").notNull(), // When they had the experience
  
  // Testimonial Content
  type: mysqlEnum("type", ["direct_review", "guest_story"]).default("direct_review").notNull(), // Type of testimonial
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Solo traveler experience"
  subtitle: varchar("subtitle", { length: 500 }), // Optional subtitle
  attributionLine: varchar("attributionLine", { length: 500 }).notNull(), // e.g., "From En Kai, Singapore, Solo Traveler"
  
  // Review Text (supports multiple sections)
  previewText: text("previewText").notNull(), // Truncated version (4-6 lines) for card display
  fullText: text("fullText").notNull(), // Main review text (section 1)
  additionalText: text("additionalText"), // Optional section 2 (e.g., feedback on booking)
  tertiaryText: text("tertiaryText"), // Optional section 3 (e.g., platform appreciation)
  
  // Images
  images: json("images").$type<Array<{
    url: string;
    alt: string;
    type: "guest" | "host" | "food" | "experience"; // Image category
    caption?: string;
  }>>().notNull(), // Array of image objects with URLs and metadata
  
  // Metadata & Tags
  badge: varchar("badge", { length: 100 }), // e.g., "Real guest experience", "Featured"
  tags: json("tags").$type<string[]>().default([]).notNull(), // e.g., ["authentic", "welcoming", "food"]
  
  // CTA Button (optional)
  ctaLabel: varchar("ctaLabel", { length: 100 }), // e.g., "Book your own experience"
  ctaUrl: varchar("ctaUrl", { length: 500 }), // URL for CTA button
  
  // Display Settings
  featured: boolean("featured").default(false).notNull(), // Show in featured carousel
  displayOrder: int("displayOrder").default(0).notNull(), // Sort order
  published: boolean("published").default(true).notNull(), // Publish/draft status
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuestTestimonial = typeof guestTestimonials.$inferSelect;
export type InsertGuestTestimonial = typeof guestTestimonials.$inferInsert;
