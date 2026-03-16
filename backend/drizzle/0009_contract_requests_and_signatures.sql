CREATE TABLE `contract_requests` (
  `id` text PRIMARY KEY NOT NULL,
  `employee_id` text NOT NULL,
  `template_ids` text NOT NULL DEFAULT '[]',
  `status` text NOT NULL DEFAULT 'pending',
  `note` text,
  `signature_mode` text NOT NULL DEFAULT 'none',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `decided_at` text,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `contract_requests_employee_id_idx` ON `contract_requests` (`employee_id`);

CREATE TABLE `employee_signatures` (
  `id` text PRIMARY KEY NOT NULL,
  `employee_id` text NOT NULL,
  `signature_data` text NOT NULL,
  `passcode_salt` text,
  `passcode_hash` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `employee_signatures_employee_id_unique` ON `employee_signatures` (`employee_id`);
CREATE INDEX `employee_signatures_employee_id_idx` ON `employee_signatures` (`employee_id`);
