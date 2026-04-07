CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostListingId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`theme` varchar(255),
	`description` text NOT NULL,
	`featuredImageUrl` varchar(500),
	`eventDate` date NOT NULL,
	`mealType` enum('lunch','dinner') NOT NULL,
	`totalSeats` int NOT NULL DEFAULT 6,
	`seatsRemaining` int NOT NULL DEFAULT 6,
	`pricePerPerson` int NOT NULL,
	`originalPrice` int,
	`discountLabel` varchar(100),
	`isPublished` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `eventId` int;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_hostListingId_host_listings_id_fk` FOREIGN KEY (`hostListingId`) REFERENCES `host_listings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;