CREATE TABLE `survey_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`guestEmail` varchar(320),
	`countries` json,
	`ageGroups` json,
	`firstTimeChina` enum('all_first_time','some_first_time','all_been_before','live_in_china'),
	`channel` enum('instagram','reddit','google','ota','friend','press','other'),
	`source` enum('post_payment','email') NOT NULL DEFAULT 'post_payment',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `survey_responses_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
ALTER TABLE `survey_responses` ADD CONSTRAINT `survey_responses_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;