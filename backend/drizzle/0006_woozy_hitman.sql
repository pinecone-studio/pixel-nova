CREATE TABLE IF NOT EXISTS `employer_signatures` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`signature_data` text NOT NULL,
	`passcode_salt` text,
	`passcode_hash` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `employer_signatures_user_id_unique` ON `employer_signatures` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `employer_signatures_user_id_idx` ON `employer_signatures` (`user_id`);
