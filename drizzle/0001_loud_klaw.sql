CREATE TABLE `commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`slashCommand` varchar(120) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`category` enum('PENSAR','ESCREVER','CRIAR','CRESCER') NOT NULL,
	`subcategory` varchar(120) NOT NULL,
	`objective` varchar(120) NOT NULL,
	`outputType` varchar(80) NOT NULL,
	`platform` varchar(120) NOT NULL,
	`promptTemplate` text NOT NULL,
	`tags` text NOT NULL,
	`difficulty` varchar(40) NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commands_id` PRIMARY KEY(`id`),
	CONSTRAINT `commands_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `commands_slashCommand_unique` UNIQUE(`slashCommand`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commandId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorite_user_command_unique` UNIQUE(`userId`,`commandId`)
);
--> statement-breakpoint
CREATE TABLE `placeholders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commandId` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`label` varchar(120) NOT NULL,
	`type` varchar(30) NOT NULL,
	`required` boolean NOT NULL DEFAULT true,
	`options` text,
	`defaultValue` text,
	CONSTRAINT `placeholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commandId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `commands_category_idx` ON `commands` (`category`);--> statement-breakpoint
CREATE INDEX `commands_active_idx` ON `commands` (`active`);--> statement-breakpoint
CREATE INDEX `placeholders_command_idx` ON `placeholders` (`commandId`);--> statement-breakpoint
CREATE INDEX `usage_user_idx` ON `usages` (`userId`,`createdAt`);