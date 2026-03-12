CREATE TABLE `otp_codes` (
  `id` text PRIMARY KEY NOT NULL,
  `employee_id` text NOT NULL,
  `code_hash` text NOT NULL,
  `attempts_remaining` integer DEFAULT 5 NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `otp_codes_employee_id_idx` ON `otp_codes` (`employee_id`);

CREATE TABLE `auth_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `employee_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `auth_sessions_token_hash_unique` ON `auth_sessions` (`token_hash`);
CREATE INDEX `auth_sessions_employee_id_idx` ON `auth_sessions` (`employee_id`);
