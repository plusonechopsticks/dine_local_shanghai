ALTER TABLE `host_interests` MODIFY COLUMN `contact` varchar(255) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `host_interests` ADD `email` varchar(320) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `host_interests` ADD `hidden` boolean DEFAULT false;