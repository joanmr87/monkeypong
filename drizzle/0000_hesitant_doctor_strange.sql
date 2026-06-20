CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`player_a_id` text NOT NULL,
	`player_b_id` text NOT NULL,
	`winner_id` text NOT NULL,
	`loser_id` text NOT NULL,
	`player_a_score` integer,
	`player_b_score` integer,
	`played_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`player_a_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_b_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loser_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nickname` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
