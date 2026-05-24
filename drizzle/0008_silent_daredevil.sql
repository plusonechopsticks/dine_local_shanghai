CREATE TABLE `review_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `review_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`hostListingId` int NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`numberOfGuests` int NOT NULL DEFAULT 1,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`photoUrls` text,
	`travellerCategory` enum('solo','friends_couples','families') NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `review_tokens` ADD CONSTRAINT `review_tokens_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE no action ON UPDATE no action;