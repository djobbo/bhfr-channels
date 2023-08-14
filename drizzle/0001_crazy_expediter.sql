ALTER TABLE "lobbys" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "lobbys" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "voice_events" ALTER COLUMN "timestamp" SET DATA TYPE timestamp;