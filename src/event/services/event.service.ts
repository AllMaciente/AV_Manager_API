import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, ilike, sql } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/db.module';
import { event, eventCircuit } from 'src/db/schema';

import type { DB } from 'src/db/db.module';
import type { EventDto, listEventsQueryDto } from '../schemas/event.schema';


@Injectable()
export class EventService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

    async findAllEvents({ search, page, limit }: listEventsQueryDto) {
        const term = search ? `%${search}%` : undefined;

        // Executar a busca dos itens paginados e a contagem total em paralelo
        const [items, totalResult] = await Promise.all([
            this.db.query.event.findMany({
                ...(term ? { where: { name: { ilike: term } } } : {}),
                with: {
                    eventCircuits: {
                        with: { circuit: true }
                    },
                    // Ordena os dias para que as datas mais recentes apareçam primeiro (descendente)
                    days: {
                        orderBy: (d, { desc }) => [desc(d.date)]
                    },
                },
                limit: limit,
                offset: (page - 1) * limit,
                // Se quiser ordenar os próprios eventos, pode adicionar aqui:
                // orderBy: [desc(event.createdAt)],
            }),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(event)
                .where(term ? ilike(event.name, term) : undefined),
        ]);

        const total = Number(totalResult[0]?.count ?? 0);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(eventId: string) {
        const result = await this.db.query.event.findFirst({
            where: { id: eventId },
            with: {
                eventCircuits: { with: { circuit: true } },
                days: { orderBy: (d, { asc }) => [asc(d.date)] },
            },
        });
        if (!result) throw new NotFoundException('evento não encontrado');
        return result
    }

    async create({ name, description, circuitoId }: EventDto) {
        const [evento] = await this.db
            .insert(event)
            .values({
                name,
                description
            })
            .returning();
        if (circuitoId?.length) {
            await this.db.insert(eventCircuit).values(
                [...new Set(circuitoId)].map((id) => ({
                    eventId: evento.id,
                    circuitId: id
                }))
            )
        }
        return await this.findById(evento.id)
    }

    async update(id: string, data: EventDto) {
        const { name, description, circuitoId } = data;

        const row = await this.db.transaction(async (tx) => {
            const [updated] = await tx
                .update(event)
                .set({ name, description })
                .where(eq(event.id, id))
                .returning()

            if (!updated) return undefined;

            if (circuitoId) {
                await tx
                    .delete(eventCircuit)
                    .where(eq(eventCircuit.eventId, id));

                if (circuitoId.length) {
                    await tx.insert(eventCircuit).values(
                        [...new Set(circuitoId)].map((circuitId) => ({
                            eventId: id,
                            circuitId
                        }))
                    )
                }
            }

            return updated;
        })

        if (!row) throw new NotFoundException('evento não encontrado');
        return this.findById(id)
    }
}
