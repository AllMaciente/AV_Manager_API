import { pgTable, text, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

export const equipamentos = pgTable("equipamentos", {
    id: varchar('id', { length: 12 })
        .primaryKey()
        .$defaultFn(() => nanoid(12)),
    name: text('name').notNull().unique()
})