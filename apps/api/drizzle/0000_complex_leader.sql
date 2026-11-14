CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`assignee_id` integer NOT NULL,
	`seed_key` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "task_status" CHECK("tasks"."status" in ('pending', 'in_progress', 'done')),
	CONSTRAINT "task_title_length" CHECK(length(trim("tasks"."title")) between 3 and 120)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_seed_key_unique` ON `tasks` (`seed_key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`seed_key` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "user_name_length" CHECK(length(trim("users"."name")) between 2 and 80)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_seed_key_unique` ON `users` (`seed_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_nocase` ON `users` (lower("email"));