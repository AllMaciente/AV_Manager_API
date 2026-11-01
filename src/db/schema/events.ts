import { date, foreignKey, pgEnum, pgTable, primaryKey, text, unique, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { circuito } from "./circuito";
import { equipamentos } from "./equipamentos";
import { users } from "./users";
import { relations } from "drizzle-orm/_relations";

const id = () => varchar('id', { length: 12 }).primaryKey().$defaultFn(() => nanoid(12));
const eId = (t) => varchar(t, { length: 12 }).notNull();

export const period = pgEnum('period', ["MORNING", "AFTERNOON"]);

export const event = pgTable('event', {
    id: id(),
    name: text('name').notNull(),
    description: text("description")
});

export const eventCircuit = pgTable('eventCircuit', {
    eventId: eId('event_id').references(() => event.id, { onDelete: "cascade" }),
    circuitId: eId("circuit_id").references(() => circuito.id)
}, (t) => [primaryKey({ columns: [t.circuitId, t.eventId] })]);

export const eventDay = pgTable('event_day', {
    eventId: eId('event_id').notNull().references(() => event.id, { onDelete: "cascade" }),
    date: date('date').notNull(),
    description: text("description"),
}, (t) => [primaryKey({ columns: [t.eventId, t.date] })]);

export const roster = pgTable('roster', {
    id: id(),
    eventId: eId('event_id').notNull(),
    date: date('date').notNull(),
    period: period('period').notNull(),
    equipamentoId: eId('equipamento_id').notNull().references(() => equipamentos.id),
    userId: eId('user_id').notNull().references(() => users.id)
}, (t) => [
    foreignKey({ columns: [t.eventId, t.date], foreignColumns: [eventDay.eventId, eventDay.date] })
        .onDelete("cascade"),
    unique().on(t.eventId, t.date, t.period, t.userId),
]);


export const eventRelations = relations(event, ({ many }) => ({
    eventCircuit: many(eventCircuit),
    days: many(eventDay)
}));

export const eventCircuitRelations = relations(eventCircuit, ({ one }) => ({
    event: one(event, { fields: [eventCircuit.eventId], references: [event.id] }),
    circuit: one(circuito, { fields: [eventCircuit.circuitId], references: [circuito.id] })
}));

export const eventDayRelations = relations(eventDay, ({ one, many }) => ({
    event: one(event, { fields: [eventDay.eventId], references: [event.id] }),
    rosters: many(roster)
}));

export const rosterRelations = relations(roster, ({ one }) => ({
    eventDay: one(eventDay, {
        fields: [roster.eventId, roster.date],
        references: [eventDay.eventId, eventDay.date]
    }),
    equipamento: one(equipamentos, { fields: [roster.equipamentoId], references: [equipamentos.id] }),
    user: one(users, { fields: [roster.userId], references: [users.id] })
}))