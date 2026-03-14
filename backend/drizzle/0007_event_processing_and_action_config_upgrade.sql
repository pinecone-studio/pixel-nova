ALTER TABLE `actions` ADD `trigger_condition` text;
ALTER TABLE `actions` ADD `required_employee_fields` text DEFAULT '[]' NOT NULL;
ALTER TABLE `actions` ADD `recipients` text DEFAULT '[]' NOT NULL;
ALTER TABLE `actions` ADD `documents` text DEFAULT '[]' NOT NULL;

CREATE TABLE `processed_events` (
  `event_id` text PRIMARY KEY NOT NULL,
  `event_type` text NOT NULL,
  `employee_id` text NOT NULL,
  `action` text,
  `status` text NOT NULL,
  `payload` text NOT NULL,
  `last_error` text,
  `processed_at` text NOT NULL
);

CREATE INDEX `processed_events_employee_id_idx` ON `processed_events` (`employee_id`);
CREATE INDEX `processed_events_status_idx` ON `processed_events` (`status`);
