import { nanoid } from "nanoid";
import { pgTable, varchar, text } from 'drizzle-orm/pg-core'

export const circuito = pgTable('circuito', {
    id: varchar('id', { length: 12 })
        .primaryKey()
        .$defaultFn(() => nanoid(12)),
    name: text('name').notNull(),
});
