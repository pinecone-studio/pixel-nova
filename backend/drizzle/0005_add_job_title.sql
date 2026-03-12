ALTER TABLE `employees` ADD `job_title` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `employees`
SET `job_title` = `level`
WHERE `job_title` = '';
