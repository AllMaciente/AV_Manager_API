CREATE TYPE "period" AS ENUM('MORNING', 'AFTERNOON');--> statement-breakpoint
CREATE TABLE "equipamentos" (
	"id" varchar(12) PRIMARY KEY,
	"name" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "user_equipamentos" (
	"id" varchar(12) PRIMARY KEY,
	"user_id" varchar(12) NOT NULL,
	"equipamento_id" varchar(12) NOT NULL,
	"ordem" integer NOT NULL,
	"sabe_operar" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_equipamentos_user_id_equipamento_id_unique" UNIQUE("user_id","equipamento_id")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" varchar(12) PRIMARY KEY,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "eventCircuit" (
	"event_id" varchar(12),
	"circuit_id" varchar(12),
	CONSTRAINT "eventCircuit_pkey" PRIMARY KEY("circuit_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "event_day" (
	"event_id" varchar(12),
	"date" date,
	"description" text,
	CONSTRAINT "event_day_pkey" PRIMARY KEY("event_id","date")
);
--> statement-breakpoint
CREATE TABLE "roster" (
	"id" varchar(12) PRIMARY KEY,
	"event_id" varchar(12) NOT NULL,
	"date" date NOT NULL,
	"period" "period" NOT NULL,
	"equipamento_id" varchar(12) NOT NULL,
	"user_id" varchar(12) NOT NULL,
	CONSTRAINT "roster_event_id_date_period_user_id_unique" UNIQUE("event_id","date","period","user_id")
);
--> statement-breakpoint
ALTER TABLE "user_equipamentos" ADD CONSTRAINT "user_equipamentos_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_equipamentos" ADD CONSTRAINT "user_equipamentos_equipamento_id_equipamentos_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "eventCircuit" ADD CONSTRAINT "eventCircuit_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "eventCircuit" ADD CONSTRAINT "eventCircuit_circuit_id_circuito_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "circuito"("id");--> statement-breakpoint
ALTER TABLE "event_day" ADD CONSTRAINT "event_day_event_id_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "roster" ADD CONSTRAINT "roster_equipamento_id_equipamentos_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id");--> statement-breakpoint
ALTER TABLE "roster" ADD CONSTRAINT "roster_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "roster" ADD CONSTRAINT "roster_event_id_date_event_day_event_id_date_fkey" FOREIGN KEY ("event_id","date") REFERENCES "event_day"("event_id","date") ON DELETE CASCADE;