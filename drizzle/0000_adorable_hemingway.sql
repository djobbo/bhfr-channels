DO $$ BEGIN
 CREATE TYPE "event_type" AS ENUM('create_lobby', 'delete_lobby', 'join_lobby', 'leave_lobby');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lobbys" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" varchar NOT NULL,
	"guild_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"room" varchar,
	"created_at" date NOT NULL,
	"deleted_at" date,
	"generator_channel_id" varchar,
	CONSTRAINT "lobbys_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" varchar NOT NULL,
	"username" varchar NOT NULL,
	"avatar" varchar,
	CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_to_lobbys" (
	"user_id" integer NOT NULL,
	"lobby_id" integer NOT NULL,
	CONSTRAINT users_to_lobbys_user_id_lobby_id PRIMARY KEY("user_id","lobby_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_to_voice_events" (
	"user_id" integer NOT NULL,
	"voice_event_id" integer NOT NULL,
	CONSTRAINT users_to_voice_events_user_id_voice_event_id PRIMARY KEY("user_id","voice_event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voice_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" date NOT NULL,
	"user_id" varchar NOT NULL,
	"lobby_id" varchar NOT NULL,
	"event_type" "event_type" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_lobbys" ADD CONSTRAINT "users_to_lobbys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_lobbys" ADD CONSTRAINT "users_to_lobbys_lobby_id_lobbys_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "lobbys"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_voice_events" ADD CONSTRAINT "users_to_voice_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_voice_events" ADD CONSTRAINT "users_to_voice_events_voice_event_id_voice_events_id_fk" FOREIGN KEY ("voice_event_id") REFERENCES "voice_events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voice_events" ADD CONSTRAINT "voice_events_user_id_users_discord_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voice_events" ADD CONSTRAINT "voice_events_lobby_id_lobbys_discord_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "lobbys"("discord_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
