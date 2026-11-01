import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/db.module';
import type { DB } from 'src/db/db.module';
import { circuito, event, eventCircuit } from 'src/db/schema';

type EventCircuitData = {
    eventId: string;
    circuitId: string;
};

@Injectable()
export class EventCircuitService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

    async findByEvent(eventId: string) {
        await this.assertEventExists(eventId);

        return this.db.query.eventCircuit.findMany({
            where: { eventId },
            with: { circuit: true },
        });
    }

    async findByCircuit(circuitId: string) {
        await this.assertCircuitExists(circuitId);

        return this.db.query.eventCircuit.findMany({
            where: { circuitId },
            with: { event: true },
        });
    }

    async findOne(eventId: string, circuitId: string) {
        const row = await this.db.query.eventCircuit.findFirst({
            where: { eventId, circuitId },
            with: {
                event: true,
                circuit: true,
            },
        });

        if (!row) throw new NotFoundException('Vínculo entre evento e circuito não encontrado');
        return row;
    }

    async create({ eventId, circuitId }: EventCircuitData) {
        await this.assertEventExists(eventId);
        await this.assertCircuitExists(circuitId);

        const [row] = await this.db
            .insert(eventCircuit)
            .values({ eventId, circuitId })
            .onConflictDoNothing({
                target: [eventCircuit.eventId, eventCircuit.circuitId],
            })
            .returning();

        if (!row) throw new ConflictException('Circuito já vinculado a este evento');
        return this.findOne(eventId, circuitId);
    }

    async update(eventId: string, circuitId: string, { circuitId: newCircuitId }: { circuitId: string }) {
        await this.findOne(eventId, circuitId);

        if (newCircuitId !== circuitId) {
            await this.assertCircuitExists(newCircuitId);

            const alreadyLinked = await this.db.query.eventCircuit.findFirst({
                where: { eventId, circuitId: newCircuitId },
            });
            if (alreadyLinked) throw new ConflictException('Circuito já vinculado a este evento');
        }

        const [row] = await this.db
            .update(eventCircuit)
            .set({ circuitId: newCircuitId })
            .where(and(
                eq(eventCircuit.eventId, eventId),
                eq(eventCircuit.circuitId, circuitId),
            ))
            .returning();

        if (!row) throw new ConflictException('Circuito já vinculado a este evento');
        return this.findOne(eventId, newCircuitId);
    }

    async remove(eventId: string, circuitId: string) {
        const [row] = await this.db
            .delete(eventCircuit)
            .where(and(
                eq(eventCircuit.eventId, eventId),
                eq(eventCircuit.circuitId, circuitId),
            ))
            .returning();

        if (!row) throw new NotFoundException('Vínculo entre evento e circuito não encontrado');
        return row;
    }

    private async assertEventExists(eventId: string) {
        const [row] = await this.db
            .select({ id: event.id })
            .from(event)
            .where(eq(event.id, eventId))
            .limit(1);

        if (!row) throw new NotFoundException('evento não encontrado');
    }

    private async assertCircuitExists(circuitId: string) {
        const [row] = await this.db
            .select({ id: circuito.id })
            .from(circuito)
            .where(eq(circuito.id, circuitId))
            .limit(1);

        if (!row) throw new NotFoundException('circuito não encontrado');
    }
}
