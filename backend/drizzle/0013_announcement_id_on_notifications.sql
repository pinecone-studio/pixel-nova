ALTER TABLE `employee_notifications` ADD COLUMN `announcement_id` text;
CREATE INDEX `employee_notifications_announcement_id_idx` ON `employee_notifications` (`announcement_id`);
