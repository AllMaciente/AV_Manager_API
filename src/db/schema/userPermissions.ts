import { pgTable, varchar, primaryKey } from 'drizzle-orm/pg-core'
import { users } from "./users";
import { permissions } from "./permissions";

export const userPermissions = pgTable(
    'user_permissions',
    {
        userId: varchar('user_id', { length: 12 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        permissionId: varchar('permission_id', { length: 12 })
            .notNull()
            .references(() => permissions.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.userId, t.permissionId] })],
);
