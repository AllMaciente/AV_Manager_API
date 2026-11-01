import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gte, ne, sql } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/db.module';
import { equipamentos, eventDay, roster, users } from 'src/db/schema';

import type { SQL } from 'drizzle-orm';
import type { DB } from 'src/db/db.module';
import type {
  createRosterDto,
  listMyRostersQueryDto,
  listRostersQueryDto,
  updateRosterDto,
} from '../schemas/roster.schema';

const rosterRelations = {
  eventDay: true,
  equipamento: true,
  user: {
    columns: {
      id: true,
      username: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

@Injectable()
export class RosterService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findAll({
    eventId,
    date,
    period,
    equipamentoId,
    userId,
    page,
    limit,
  }: listRostersQueryDto) {
    const conditions: SQL[] = [];

    if (eventId) conditions.push(eq(roster.eventId, eventId));
    if (date) conditions.push(eq(roster.date, date));
    if (period) conditions.push(eq(roster.period, period));
    if (equipamentoId) conditions.push(eq(roster.equipamentoId, equipamentoId));
    if (userId) conditions.push(eq(roster.userId, userId));

    return this.paginate(conditions.length ? and(...conditions) : undefined, {
      page,
      limit,
    });
  }

  async findMine(
    userId: string,
    { includePast, page, limit }: listMyRostersQueryDto,
  ) {
    const conditions: SQL[] = [eq(roster.userId, userId)];

    if (!includePast) {
      conditions.push(gte(roster.date, sql`current_date`));
    }

    return this.paginate(and(...conditions), { page, limit });
  }

  private async paginate(
    where: SQL | undefined,
    { page, limit }: { page: number; limit: number },
  ) {
    const [items, totalResult] = await Promise.all([
      this.db.query.roster.findMany({
        where: where ? { RAW: where } : undefined,
        with: rosterRelations,
        orderBy: (r, { asc }) => [asc(r.date), asc(r.period), asc(r.id)],
        limit,
        offset: (page - 1) * limit,
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(roster)
        .where(where),
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

  async findById(id: string) {
    const row = await this.db.query.roster.findFirst({
      where: { id },
      with: rosterRelations,
    });

    if (!row) throw new NotFoundException('escala não encontrada');
    return row;
  }

  async create(data: createRosterDto) {
    await this.validateReferences(data);

    const [row] = await this.db
      .insert(roster)
      .values(data)
      .onConflictDoNothing({
        target: [roster.eventId, roster.date, roster.period, roster.userId],
      })
      .returning();

    if (!row) {
      throw new ConflictException('usuário já está escalado neste período');
    }

    return this.findById(row.id);
  }

  async update(id: string, data: updateRosterDto) {
    const current = await this.findById(id);

    const next = {
      eventId: data.eventId ?? current.eventId,
      date: data.date ?? current.date,
      period: data.period ?? current.period,
      equipamentoId: data.equipamentoId ?? current.equipamentoId,
      userId: data.userId ?? current.userId,
    };

    await this.validateReferences(next);

    const changedSlot =
      next.eventId !== current.eventId ||
      next.date !== current.date ||
      next.period !== current.period ||
      next.userId !== current.userId;

    if (changedSlot) {
      const [conflict] = await this.db
        .select({ id: roster.id })
        .from(roster)
        .where(
          and(
            eq(roster.eventId, next.eventId),
            eq(roster.date, next.date),
            eq(roster.period, next.period),
            eq(roster.userId, next.userId),
            ne(roster.id, id),
          ),
        )
        .limit(1);

      if (conflict) {
        throw new ConflictException('usuário já está escalado neste período');
      }
    }

    const [row] = await this.db
      .update(roster)
      .set(next)
      .where(eq(roster.id, id))
      .returning();

    if (!row) throw new NotFoundException('escala não encontrada');
    return this.findById(row.id);
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(roster)
      .where(eq(roster.id, id))
      .returning();

    if (!row) throw new NotFoundException('escala não encontrada');
    return row;
  }

  private async validateReferences({
    eventId,
    date,
    equipamentoId,
    userId,
  }: Pick<createRosterDto, 'eventId' | 'date' | 'equipamentoId' | 'userId'>) {
    await this.assertEventDayExists(eventId, date);
    await this.assertEquipamentoExists(equipamentoId);
    await this.assertUserExists(userId);
  }

  private async assertEventDayExists(eventId: string, date: string) {
    const [row] = await this.db
      .select({ eventId: eventDay.eventId })
      .from(eventDay)
      .where(and(eq(eventDay.eventId, eventId), eq(eventDay.date, date)))
      .limit(1);

    if (!row) throw new NotFoundException('dia do evento não encontrado');
  }

  private async assertEquipamentoExists(equipamentoId: string) {
    const [row] = await this.db
      .select({ id: equipamentos.id })
      .from(equipamentos)
      .where(eq(equipamentos.id, equipamentoId))
      .limit(1);

    if (!row) throw new NotFoundException('equipamento não encontrado');
  }

  private async assertUserExists(userId: string) {
    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) throw new NotFoundException('usuário não encontrado');
  }
}
