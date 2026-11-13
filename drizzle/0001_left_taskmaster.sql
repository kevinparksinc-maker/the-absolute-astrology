CREATE TABLE `saved_charts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`title` varchar(180) NOT NULL,
	`location` varchar(240) NOT NULL,
	`input` json NOT NULL,
	`chart` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_charts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`chartId` int,
	`title` varchar(180) NOT NULL,
	`mode` enum('natal','transit','combined') NOT NULL,
	`content` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `saved_charts_open_id_idx` ON `saved_charts` (`openId`);--> statement-breakpoint
CREATE INDEX `saved_readings_open_id_idx` ON `saved_readings` (`openId`);