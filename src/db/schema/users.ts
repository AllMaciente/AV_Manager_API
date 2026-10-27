import { nanoid } from "nanoid";
import { pgTable, varchar, text, timestamp, uniqueIndex, boolean } from 'drizzle-orm/pg-core'
import { sql } from "drizzle-orm";
import { circuito } from "./circuito";
import { relations } from "drizzle-orm/_relations";
import { userEquipamentos } from "./userEquipamentos";

export const users = pgTable("users", {
    id: varchar("id", { length: 12 })
        .primaryKey()
        .$defaultFn(() => nanoid(12)),
    username: text("username").notNull(),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    circuitoId: varchar('circuito_id', { length: 12 })
        .references(() => circuito.id, { onDelete: 'set null' }),
    email: text("email").unique(),
    password: text("password").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isAdmin: boolean('is_admin').notNull().default(false),
},
    (t) => [
        uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
        uniqueIndex("users_username_unique").on(sql`lower(${t.username})`),
    ]
)


export const usersRelations = relations(users, ({ many }) => ({
    equipamentos: many(userEquipamentos)
}))