CREATE TABLE `commandImports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`format` enum('json','csv') NOT NULL,
	`importedCount` int NOT NULL DEFAULT 0,
	`status` varchar(40) NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commandImports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `imports_user_idx` ON `commandImports` (`userId`,`createdAt`);