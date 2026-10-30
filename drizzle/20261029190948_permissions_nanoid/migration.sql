-- Preserva as permissões já atribuídas aos usuários antes de trocar os ids
ALTER TABLE "user_permissions" ADD COLUMN "permission_key" varchar(64);--> statement-breakpoint
UPDATE "user_permissions" AS up
SET "permission_key" = p."key"
FROM "permissions" AS p
WHERE p."id" = up."permission_id";--> statement-breakpoint
ALTER TABLE "user_permissions" ALTER COLUMN "permission_key" SET NOT NULL;--> statement-breakpoint

-- Recria permissions.id como varchar(12) (nanoid)
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permission_id_permissions_id_fkey";--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_pkey";--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN "permission_id";--> statement-breakpoint
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_pkey";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "id";--> statement-breakpoint
DROP SEQUENCE IF EXISTS "permissions_id_seq";--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "id" varchar(12);--> statement-breakpoint
UPDATE "permissions"
SET "id" = substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");--> statement-breakpoint

-- Recria user_permissions.permission_id como varchar(12) e restaura os vínculos
ALTER TABLE "user_permissions" ADD COLUMN "permission_id" varchar(12);--> statement-breakpoint
UPDATE "user_permissions" AS up
SET "permission_id" = p."id"
FROM "permissions" AS p
WHERE p."key" = up."permission_key";--> statement-breakpoint
ALTER TABLE "user_permissions" ALTER COLUMN "permission_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id", "permission_id");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN "permission_key";
