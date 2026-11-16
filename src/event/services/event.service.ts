import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, ilike, sql } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/db.module';
import { circuito, event, eventCircuit, eventDay } from 'src/db/schema';

import type { SQL } from 'drizzle-orm';
import type { DB } from 'src/db/db.module';
import type {
  EventDto,
  listCircuitEventsQueryDto,
  listEventsQueryDto,
} from '../schemas/event.schema';

type EventFilters = {
  search?: string;
  circuitId?: string;
  includePast: boolean;
};

@Injectable()
export class EventService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findAllEvents({
    search,
    includePast,
    page,
    limit,
  }: listEventsQueryDto) {
    return this.paginateEvents({ search, includePast }, { page, limit });
  }

  async findByCircuit(
    circuitId: string,
    { includePast, page, limit }: listCircuitEventsQueryDto,
  ) {
    await this.assertCircuitExists(circuitId);
    return this.paginateEvents({ circuitId, includePast }, { page, limit });
  }

  private async paginateEvents(
    { search, circuitId, includePast }: EventFilters,
    { page, limit }: { page: number; limit: number },
  ) {
    const term = search ? `%${search}%` : undefined;

    const buildWhere = (table: typeof event) => {
      const conditions: SQL[] = [];

      if (term) conditions.push(ilike(table.name, term));

      if (circuitId) {
        conditions.push(
          sql`exists (
                        select 1 from ${eventCircuit}
                        where ${eventCircuit.eventId} = ${table.id}
                          and ${eventCircuit.circuitId} = ${circuitId}
                    )`,
        );
      }

      // Por padrão só entram eventos que ainda têm algum dia a partir de hoje.
      if (!includePast) conditions.push(this.futureDayExists(table));

      return conditions;
    };

    const conditions = buildWhere(event);
    const whereSql = conditions.length ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.event.findMany({
        ...(conditions.length
          ? {
              where: {
                RAW: (table: typeof event) => and(...buildWhere(table))!,
              },
            }
          : {}),
        with: {
          eventCircuits: {
            with: { circuit: true },
          },
          days: {
            ...this.futureDaysFilter(includePast),
            // Ordena os dias para que as datas mais recentes apareçam primeiro (descendente)
            orderBy: (d, { desc }) => [desc(d.date)],
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
        .where(whereSql),
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

  async findById(eventId: string, includePast = false) {
    const result = await this.db.query.event.findFirst({
      where: { id: eventId },
      with: {
        eventCircuits: { with: { circuit: true } },
        days: {
          ...this.futureDaysFilter(includePast),
          orderBy: (d, { asc }) => [asc(d.date)],
        },
      },
    });
    if (!result) throw new NotFoundException('evento não encontrado');
    return result;
  }

  async create({ name, description, circuitoId }: EventDto) {
    const [evento] = await this.db
      .insert(event)
      .values({
        name,
        description,
      })
      .returning();
    if (circuitoId?.length) {
      await this.db.insert(eventCircuit).values(
        [...new Set(circuitoId)].map((id) => ({
          eventId: evento.id,
          circuitId: id,
        })),
      );
    }
    return await this.findById(evento.id, true);
  }

  async update(id: string, data: EventDto) {
    const { name, description, circuitoId } = data;

    const row = await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(event)
        .set({ name, description })
        .where(eq(event.id, id))
        .returning();

      if (!updated) return undefined;

      if (circuitoId) {
        await tx.delete(eventCircuit).where(eq(eventCircuit.eventId, id));

        if (circuitoId.length) {
          await tx.insert(eventCircuit).values(
            [...new Set(circuitoId)].map((circuitId) => ({
              eventId: id,
              circuitId,
            })),
          );
        }
      }

      return updated;
    });

    if (!row) throw new NotFoundException('evento não encontrado');
    return this.findById(id, true);
  }

  private futureDayExists(table: typeof event) {
    return sql`exists (
            select 1 from ${eventDay}
            where ${eventDay.eventId} = ${table.id}
              and ${eventDay.date} >= current_date
        )`;
  }

  private futureDaysFilter(includePast: boolean) {
    if (includePast) return {};

    return {
      where: {
        RAW: (day: typeof eventDay) => gte(day.date, sql`current_date`),
      },
    };
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
