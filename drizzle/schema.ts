import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, text, timestamp, index, foreignKey, date, varchar, json, mysqlEnum, decimal } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const announcements = mysqlTable("announcements", {
	id: int().autoincrement().notNull(),
	content: text().notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const blockedDates = mysqlTable("blocked_dates", {
	id: int().autoincrement().notNull(),
	hostListingId: int().notNull().references(() => hostListings.id),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	startDate: date({ mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	endDate: date({ mode: 'string' }).notNull(),
	reason: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_host_dates").on(table.hostListingId, table.startDate, table.endDate),
]);

export const blogPostViews = mysqlTable("blog_post_views", {
	id: varchar({ length: 255 }).notNull(),
	blogPostId: varchar({ length: 255 }).notNull(),
	viewCount: int().default(0).notNull(),
	lastViewedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const blogPosts = mysqlTable("blog_posts", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	slug: varchar({ length: 500 }).notNull(),
	excerpt: text().notNull(),
	content: text().notNull(),
	authorName: varchar({ length: 255 }).default('Dai Bin').notNull(),
	featuredImageUrl: varchar({ length: 500 }),
	tags: json().notNull(),
	metaDescription: text(),
	metaKeywords: varchar({ length: 500 }),
	published: tinyint().default(0),
	publishedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("blog_posts_slug_unique").on(table.slug),
]);

export const bookings = mysqlTable("bookings", {
	id: int().autoincrement().notNull(),
	hostListingId: int().notNull().references(() => hostListings.id),
	guestName: varchar({ length: 255 }).notNull(),
	guestEmail: varchar({ length: 320 }).notNull(),
	guestPhone: varchar({ length: 20 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	requestedDate: date({ mode: 'string' }).notNull(),
	mealType: mysqlEnum(['lunch','dinner']).notNull(),
	numberOfGuests: int().default(1).notNull(),
	specialRequests: text(),
	bookingStatus: mysqlEnum(['pending','confirmed','cancelled','rejected']).default('pending').notNull(),
	hostNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
	paymentStatus: mysqlEnum(['pending','paid','refunded']).default('pending'),
	totalAmount: decimal({ precision: 10, scale: 2 }),
	paymentDate: timestamp({ mode: 'string' }),
	stripeSessionId: varchar({ length: 255 }),
	reminderEmailSent: tinyint().default(0),
	hidden: tinyint().default(0),
});

export const chatMessages = mysqlTable("chat_messages", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => chatSessions.id),
	senderType: mysqlEnum(['visitor','ai','admin']).notNull(),
	content: text().notNull(),
	adminName: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const chatSessions = mysqlTable("chat_sessions", {
	id: int().autoincrement().notNull(),
	visitorName: varchar({ length: 255 }),
	visitorEmail: varchar({ length: 320 }),
	sessionId: varchar({ length: 100 }).notNull(),
	status: mysqlEnum(['active','needs_human','resolved']).default('active').notNull(),
	adminTookOver: tinyint().default(0).notNull(),
	adminTookOverAt: timestamp({ mode: 'string' }),
	lastMessageAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("sessionId").on(table.sessionId),
]);

export const guestTestimonials = mysqlTable("guest_testimonials", {
	id: int().autoincrement().notNull(),
	guestName: varchar({ length: 255 }).notNull(),
	guestLocation: varchar({ length: 255 }).notNull(),
	travelerType: varchar({ length: 100 }).notNull(),
	hostListingId: int().notNull().references(() => hostListings.id, { onDelete: "cascade" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	experienceDate: date({ mode: 'string' }).notNull(),
	type: mysqlEnum(['direct_review','guest_story']).default('direct_review').notNull(),
	title: varchar({ length: 255 }).notNull(),
	subtitle: varchar({ length: 500 }),
	attributionLine: varchar({ length: 500 }).notNull(),
	previewText: text().notNull(),
	fullText: text().notNull(),
	additionalText: text(),
	tertiaryText: text(),
	images: json().notNull(),
	badge: varchar({ length: 100 }),
	tags: json().notNull(),
	ctaLabel: varchar({ length: 100 }),
	ctaUrl: varchar({ length: 500 }),
	featured: tinyint().default(0).notNull(),
	displayOrder: int().default(0).notNull(),
	published: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const hostAccounts = mysqlTable("host_accounts", {
	id: int().autoincrement().notNull(),
	hostListingId: int().notNull().references(() => hostListings.id),
	email: varchar({ length: 320 }).notNull(),
	passwordHash: varchar({ length: 255 }).notNull(),
	lastLoginAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("hostListingId").on(table.hostListingId),
	index("email").on(table.email),
]);

export const hostAvailabilityBlocks = mysqlTable("host_availability_blocks", {
	id: int().autoincrement().notNull(),
	hostListingId: int().notNull().references(() => hostListings.id),
	blockType: mysqlEnum(['date','weekday','all_day']).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	blockDate: date({ mode: 'string' }),
	blockWeekday: int(),
	mealType: mysqlEnum(['lunch','dinner','both']).default('both').notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const hostListings = mysqlTable("host_listings", {
	id: int().autoincrement().notNull(),
	hostName: varchar({ length: 255 }).notNull(),
	profilePhotoUrl: varchar({ length: 500 }),
	languages: json().notNull(),
	bio: text().notNull(),
	activities: json(),
	email: varchar({ length: 320 }).notNull(),
	wechatOrPhone: varchar({ length: 100 }).notNull(),
	district: varchar({ length: 100 }).notNull(),
	fullAddress: text(),
	availability: json().notNull(),
	maxGuests: int().default(2).notNull(),
	cuisineStyle: varchar({ length: 255 }).notNull(),
	title: text(),
	menuDescription: text().notNull(),
	foodPhotoUrls: json().notNull(),
	introVideoUrl: varchar({ length: 500 }),
	dietaryNote: text(),
	dietaryAccommodations: json(),
	mealDurationMinutes: int().default(120).notNull(),
	pricePerPerson: int().default(100).notNull(),
	otherNotes: text(),
	kidsFriendly: tinyint().default(1).notNull(),
	hasPets: tinyint().default(0).notNull(),
	petDetails: varchar({ length: 255 }),
	otherHouseholdInfo: text(),
	householdFeatures: json(),
	status: mysqlEnum(['pending','approved','rejected']).default('pending').notNull(),
	adminNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	viewCount: int().default(0).notNull(),
	discountPercentage: int().default(0),
	displayOrder: int().default(0).notNull(),
	availabilityComments: text(),
	overseasExperience: text(),
	funFacts: text(),
	whyHost: text(),
	culturalPassions: text(),
	otherPassions: text(),
});

export const interestSubmissions = mysqlTable("interest_submissions", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	interestType: mysqlEnum(['traveler','host']).notNull(),
	message: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	hidden: tinyint().default(0),
});

export const pageViews = mysqlTable("page_views", {
	id: int().autoincrement().notNull(),
	pageType: varchar({ length: 50 }).notNull(),
	hostListingId: int(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	viewDate: date({ mode: 'string' }).notNull(),
	viewCount: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("unique_page_view").on(table.pageType, table.hostListingId, table.viewDate),
	index("idx_pageType").on(table.pageType),
	index("idx_viewDate").on(table.viewDate),
]);

export const payments = mysqlTable("payments", {
	id: int().autoincrement().notNull(),
	bookingId: int().notNull().references(() => bookings.id),
	stripePaymentIntentId: varchar({ length: 255 }).notNull(),
	stripeClientSecret: varchar({ length: 500 }).notNull(),
	amountInCents: int().notNull(),
	currency: varchar({ length: 3 }).default('cny').notNull(),
	status: mysqlEnum(['pending','succeeded','failed','cancelled']).default('pending').notNull(),
	hostListingId: int().notNull().references(() => hostListings.id),
	guestEmail: varchar({ length: 320 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("stripePaymentIntentId").on(table.stripePaymentIntentId),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);
