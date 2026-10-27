CREATE TABLE "permissions" (
	"id" smallserial PRIMARY KEY,
	"key" varchar(64) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"user_id" varchar(12),
	"permission_id" smallint,
	CONSTRAINT "user_permissions_pkey" PRIMARY KEY("user_id","permission_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" (lower("email"));--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;