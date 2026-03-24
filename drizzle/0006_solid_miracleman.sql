ALTER TABLE `blog_post_views` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `blog_post_views` MODIFY COLUMN `blogPostId` varchar(255) NOT NULL;