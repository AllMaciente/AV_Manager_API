import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/db.module';
import { event, eventDay } from 'src/db/schema';

import type { DB } from 'src/db/db.module';
import type {
  createEventDayDto,
  listCreateEventDayDto,
  updateEventDayDto,
} from '../schemas/event-day.schema';

const rosterRelations = {
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
export class EventDayService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async getDays(eventId: string) {
    await this.assertEventExists(eventId);

    return this.db.query.eventDay.findMany({
      where: { eventId },
      with: {
        rosters: { with: rosterRelations },
      },
      orderBy: (d, { asc }) => [asc(d.date)],
    });
  }

  async getDay(eventId: string, date: string) {
    const day = await this.db.query.eventDay.findFirst({
      where: { eventId, date },
      with: {
        rosters: { with: rosterRelations },
      },
    });

    if (!day) throw new NotFoundException('dia do evento não encontrado');
    return day;
  }

  async createOne(data: createEventDayDto) {
    await this.assertEventExists(data.eventId);

    const [day] = await this.db
      .insert(eventDay)
      .values(data)
      .onConflictDoNothing({
        target: [eventDay.eventId, eventDay.date],
      })
      .returning();

    if (!day) throw new ConflictException('dia já cadastrado para este evento');
    return this.getDay(day.eventId, day.date);
  }

  async createMany(data: listCreateEventDayDto) {
    if (!data.length) return [];

    await this.assertEventsExist([...new Set(data.map((day) => day.eventId))]);

    return this.db
      .insert(eventDay)
      .values(data)
      .onConflictDoNothing({
        target: [eventDay.eventId, eventDay.date],
      })
      .returning();
  }

  async update(eventId: string, date: string, data: updateEventDayDto) {
    const [day] = await this.db
      .update(eventDay)
      .set(data)
      .where(and(eq(eventDay.eventId, eventId), eq(eventDay.date, date)))
      .returning();

    if (!day) throw new NotFoundException('dia do evento não encontrado');
    return this.getDay(day.eventId, day.date);
  }

  async remove(eventId: string, date: string) {
    const [day] = await this.db
      .delete(eventDay)
      .where(and(eq(eventDay.eventId, eventId), eq(eventDay.date, date)))
      .returning();

    if (!day) throw new NotFoundException('dia do evento não encontrado');
    return day;
  }

  private async assertEventExists(eventId: string) {
    const [row] = await this.db
      .select({ id: event.id })
      .from(event)
      .where(eq(event.id, eventId))
      .limit(1);

    if (!row) throw new NotFoundException('evento não encontrado');
  }

  private async assertEventsExist(eventIds: string[]) {
    if (!eventIds.length) return;

    const rows = await this.db
      .select({ id: event.id })
      .from(event)
      .where(inArray(event.id, eventIds));

    if (rows.length !== eventIds.length) {
      throw new NotFoundException('evento não encontrado');
    }
  }
}
