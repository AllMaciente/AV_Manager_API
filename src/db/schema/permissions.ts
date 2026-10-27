import { pgTable, varchar, smallserial } from 'drizzle-orm/pg-core'

export const permissions = pgTable('permissions', {
    id: smallserial('id').primaryKey(),
    key: varchar('key', { length: 64 }).notNull().unique(),
});
