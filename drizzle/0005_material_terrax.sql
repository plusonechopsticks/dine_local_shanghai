CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_post_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blogPostId` int NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`lastViewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_post_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`authorName` varchar(255) NOT NULL DEFAULT 'Dai Bin',
	`featuredImageUrl` varchar(500),
	`tags` json NOT NULL,
	`metaDescription` text,
	`metaKeywords` varchar(500),
	`published` boolean DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostListingId` int NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`guestEmail` varchar(320) NOT NULL,
	`guestPhone` varchar(20),
	`requestedDate` date NOT NULL,
	`mealType` enum('lunch','dinner') NOT NULL,
	`numberOfGuests` int NOT NULL DEFAULT 1,
	`specialRequests` text,
	`bookingStatus` enum('pending','confirmed','cancelled','rejected') NOT NULL DEFAULT 'pending',
	`hostNotes` text,
	`hidden` boolean DEFAULT false,
	`paymentStatus` enum('pending','paid','refunded') DEFAULT 'pending',
	`totalAmount` decimal(10,2),
	`paymentDate` timestamp,
	`stripeSessionId` varchar(255),
	`reminderEmailSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`senderType` enum('visitor','ai','admin') NOT NULL,
	`content` text NOT NULL,
	`adminName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorName` varchar(255),
	`visitorEmail` varchar(320),
	`sessionId` varchar(100) NOT NULL,
	`status` enum('active','needs_human','resolved') NOT NULL DEFAULT 'active',
	`adminTookOver` boolean NOT NULL DEFAULT false,
	`adminTookOverAt` timestamp,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `chat_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostListingId` int NOT NULL,
	`guestEmail` varchar(320) NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`bookingId` int,
	`subject` varchar(255) NOT NULL,
	`lastMessage` text,
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `host_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostListingId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `host_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `host_accounts_hostListingId_unique` UNIQUE(`hostListingId`),
	CONSTRAINT `host_accounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `host_availability_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostListingId` int NOT NULL,
	`blockType` enum('date','weekday','all_day') NOT NULL,
	`blockDate` date,
	`blockWeekday` int,
	`mealType` enum('lunch','dinner','both') NOT NULL DEFAULT 'both',
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `host_availability_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `host_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`district` varchar(100) NOT NULL,
	`contact` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `host_interests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `host_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostName` varchar(255) NOT NULL,
	`profilePhotoUrl` varchar(500),
	`languages` json NOT NULL,
	`bio` text NOT NULL,
	`activities` json NOT NULL DEFAULT ('[]'),
	`overseasExperience` text,
	`funFacts` text,
	`whyHost` text,
	`culturalPassions` text,
	`otherPassions` text,
	`email` varchar(320) NOT NULL,
	`wechatOrPhone` varchar(100) NOT NULL,
	`district` varchar(100) NOT NULL,
	`fullAddress` text,
	`availability` json NOT NULL,
	`availabilityComments` text,
	`maxGuests` int NOT NULL DEFAULT 2,
	`cuisineStyle` varchar(255) NOT NULL,
	`title` varchar(500),
	`menuDescription` text NOT NULL,
	`foodPhotoUrls` json NOT NULL,
	`introVideoUrl` varchar(500),
	`dietaryNote` text,
	`mealDurationMinutes` int NOT NULL DEFAULT 120,
	`pricePerPerson` int NOT NULL DEFAULT 100,
	`otherNotes` text,
	`kidsFriendly` boolean NOT NULL DEFAULT true,
	`hasPets` boolean NOT NULL DEFAULT false,
	`petDetails` varchar(255),
	`householdFeatures` json NOT NULL DEFAULT ('[]'),
	`otherHouseholdInfo` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`discountPercentage` int NOT NULL DEFAULT 0,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `host_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interest_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`interestType` enum('traveler','host') NOT NULL,
	`message` text,
	`hidden` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interest_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderType` enum('host','guest') NOT NULL,
	`senderName` varchar(255) NOT NULL,
	`senderEmail` varchar(320) NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageType` enum('home','browse_hosts','become_host','host_detail') NOT NULL,
	`hostListingId` int,
	`viewDate` date NOT NULL,
	`viewCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blog_post_views` ADD CONSTRAINT `blog_post_views_blogPostId_blog_posts_id_fk` FOREIGN KEY (`blogPostId`) REFERENCES `blog_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sessionId_chat_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `chat_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `host_accounts` ADD CONSTRAINT `host_accounts_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `host_availability_blocks` ADD CONSTRAINT `host_availability_blocks_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `page_views` ADD CONSTRAINT `page_views_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE cascade ON UPDATE no action;