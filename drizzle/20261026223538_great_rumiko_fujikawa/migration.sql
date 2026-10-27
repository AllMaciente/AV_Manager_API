CREATE TABLE "circuito" (
	"id" varchar(12) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "circuito_id" varchar(12);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_circuito_id_circuito_id_fkey" FOREIGN KEY ("circuito_id") REFERENCES "circuito"("id") ON DELETE SET NULL;