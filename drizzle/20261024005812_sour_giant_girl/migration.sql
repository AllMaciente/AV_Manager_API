CREATE TABLE "users" (
	"id" varchar(12) PRIMARY KEY,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"email_verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" (lower("email"));