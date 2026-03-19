ALTER TABLE `audit_log` ADD `hr_signed_all` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_log` ADD `hr_signed_all_at` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `template_id` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `template_file` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `template_data` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `hr_signed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `hr_signature_data` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `hr_signed_at` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `employee_signed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `employee_signature_data` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `employee_signed_at` text;