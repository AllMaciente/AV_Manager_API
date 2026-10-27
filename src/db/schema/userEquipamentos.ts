import { boolean, integer, pgTable, unique, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { equipamentos } from "./equipamentos";
import { relations } from "drizzle-orm/_relations";

export const userEquipamentos = pgTable("user_equipamentos", {
    id: varchar("id", { length: 12 })
        .primaryKey()
        .$defaultFn(() => nanoid(12)),
    userId: varchar("user_id", { length: 12 })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    equipamentoId: varchar("equipamento_id", { length: 12 })
        .notNull()
        .references(() => equipamentos.id, { onDelete: "cascade" }),
    ordem: integer("ordem").notNull(),
    sabeOperar: boolean('sabe_operar').notNull().default(true)
},
    (t) => [unique().on(t.userId, t.equipamentoId)]
)

export const userEquipamentosRelations = relations(userEquipamentos, ({ one }) => ({
    user: one(users, { fields: [userEquipamentos.userId], references: [users.id] }),
    equipamento: one(equipamentos, {
        fields: [userEquipamentos.equipamentoId],
        references: [equipamentos.id],
    })
}))

