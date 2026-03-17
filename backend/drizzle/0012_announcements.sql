CREATE TABLE `announcements` (
  `id` text PRIMARY KEY,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `status` text NOT NULL DEFAULT 'draft',
  `audience` text NOT NULL DEFAULT 'all',
  `created_by` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `published_at` text
);

CREATE INDEX `announcements_status_idx` ON `announcements` (`status`);
