ALTER TABLE "documents" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "github_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "twitter_url" text;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "url";