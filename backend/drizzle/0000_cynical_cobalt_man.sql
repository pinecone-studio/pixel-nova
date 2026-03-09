CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phase` text NOT NULL,
	`trigger_fields` text NOT NULL
);

CREATE UNIQUE INDEX `actions_name_unique` ON `actions` (`name`);

CREATE INDEX `actions_name_idx` ON `actions` (`name`);

CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`action` text NOT NULL,
	`documents_generated` integer DEFAULT false NOT NULL,
	`recipients_notified` integer DEFAULT false NOT NULL,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `audit_log_employee_id_idx` ON `audit_log` (`employee_id`);
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`action` text NOT NULL,
	`document_name` text NOT NULL,
	`storage_url` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `documents_employee_id_idx` ON `documents` (`employee_id`);

CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_code` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`department` text NOT NULL,
	`branch` text NOT NULL,
	`level` text NOT NULL,
	`hire_date` text NOT NULL,
	`termination_date` text,
	`status` text NOT NULL
);

CREATE UNIQUE INDEX `employees_employee_code_unique` ON `employees` (`employee_code`);

CREATE INDEX `employees_employee_code_idx` ON `employees` (`employee_code`);

CREATE TABLE `recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL
);

CREATE UNIQUE INDEX `recipients_email_unique` ON `recipients` (`email`);