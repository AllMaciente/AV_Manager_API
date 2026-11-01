import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
    event: {
        eventCircuits: r.many.eventCircuit({
            from: r.event.id,
            to: r.eventCircuit.eventId,
        }),
        days: r.many.eventDay({
            from: r.event.id,
            to: r.eventDay.eventId,
        }),
    },
    eventCircuit: {
        event: r.one.event({
            from: r.eventCircuit.eventId,
            to: r.event.id,
        }),
        circuit: r.one.circuito({
            from: r.eventCircuit.circuitId,
            to: r.circuito.id,
        }),
    },
    eventDay: {
        event: r.one.event({
            from: r.eventDay.eventId,
            to: r.event.id,
        }),
        rosters: r.many.roster({
            from: [r.eventDay.eventId, r.eventDay.date],
            to: [r.roster.eventId, r.roster.date],
        }),
    },
    roster: {
        eventDay: r.one.eventDay({
            from: [r.roster.eventId, r.roster.date],
            to: [r.eventDay.eventId, r.eventDay.date],
        }),
        equipamento: r.one.equipamentos({
            from: r.roster.equipamentoId,
            to: r.equipamentos.id,
        }),
        user: r.one.users({
            from: r.roster.userId,
            to: r.users.id,
        }),
    },
    users: {
        equipamentos: r.many.userEquipamentos({
            from: r.users.id,
            to: r.userEquipamentos.userId,
        }),
    },
    userEquipamentos: {
        user: r.one.users({
            from: r.userEquipamentos.userId,
            to: r.users.id,
        }),
        equipamento: r.one.equipamentos({
            from: r.userEquipamentos.equipamentoId,
            to: r.equipamentos.id,
        }),
    },
}));
