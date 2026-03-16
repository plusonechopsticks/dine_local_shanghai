CREATE TABLE `host_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`district` varchar(100) NOT NULL,
	`contact` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `host_interests_id` PRIMARY KEY(`id`)
);
