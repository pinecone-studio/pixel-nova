CREATE TABLE `employee_notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `employee_id` text NOT NULL,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `status` text NOT NULL DEFAULT 'unread',
  `created_at` text NOT NULL,
  `read_at` text,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `employee_notifications_employee_id_idx` ON `employee_notifications` (`employee_id`);
