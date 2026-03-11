ALTER TABLE `audit_log` ADD `phase` text NOT NULL DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE `audit_log` ADD `actor_id` text;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `actor_role` text NOT NULL DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE `audit_log` ADD `document_ids` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `audit_log` ADD `recipient_roles` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `audit_log` ADD `recipient_emails` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `audit_log` ADD `incomplete_fields` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `audit_log` ADD `notification_attempted` integer NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `notification_error` text;
