import { nanoid } from 'nanoid';
import { pgTable, varchar } from 'drizzle-orm/pg-core'

export const permissions = pgTable('permissions', {
    id: varchar('id', { length: 12 })
        .primaryKey()
        .$defaultFn(() => nanoid(12)),
    key: varchar('key', { length: 64 }).notNull().unique(),
});
