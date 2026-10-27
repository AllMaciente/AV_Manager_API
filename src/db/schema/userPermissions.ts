import { pgTable, varchar, primaryKey, smallint } from 'drizzle-orm/pg-core'
import { users } from "./users";
import { permissions } from "./permissions";

export const userPermissions = pgTable(
    'user_permissions',
    {
        userId: varchar('user_id', { length: 12 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        permissionId: smallint('permission_id')
            .notNull()
            .references(() => permissions.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.userId, t.permissionId] })],
);
