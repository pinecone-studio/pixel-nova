ALTER TABLE `audit_log` ADD `employee_signed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `employee_signed_at` text;