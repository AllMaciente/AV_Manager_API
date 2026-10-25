import { nanoid } from "nanoid";
import { pgTable, varchar, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
    id: varchar("id", { length: 12 })
        .primaryKey()
        .$defaultFn(() => nanoid(12)),
    username: text("username").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
},
    (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),]
)