import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { circuito, users } from '../db/schema';

type CircuitoData = {
    name: string;
};

@Injectable()
export class CircuitosService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

    async findAll() {
        return this.db.select().from(circuito).orderBy(circuito.name);
    }

    async findById(id: string) {
        const [row] = await this.db
            .select()
            .from(circuito)
            .where(eq(circuito.id, id))
            .limit(1);

        if (!row) throw new NotFoundException('Circuito não encontrado');
        return row;
    }

    async create(data: CircuitoData) {
        const [row] = await this.db
            .insert(circuito)
            .values(data)
            .returning();
        return row;
    }

    async update(id: string, data: CircuitoData) {
        const [row] = await this.db
            .update(circuito)
            .set(data)
            .where(eq(circuito.id, id))
            .returning();

        if (!row) throw new NotFoundException('Circuito não encontrado');
        return row;
    }

    async findUsers(circuitoId: string) {
        await this.findById(circuitoId);

        return this.db
            .select({
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                middleName: users.middleName,
                lastName: users.lastName,
                email: users.email,
                circuitoId: users.circuitoId,
                circuitoName: circuito.name,
            })
            .from(users)
            .leftJoin(circuito, eq(users.circuitoId, circuito.id))
            .where(eq(users.circuitoId, circuitoId));
    }

    async assignUser(circuitoId: string, userId: string) {
        const found = await this.findById(circuitoId);

        const [user] = await this.db
            .update(users)
            .set({ circuitoId })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                middleName: users.middleName,
                lastName: users.lastName,
                email: users.email,
                circuitoId: users.circuitoId,
            });

        if (!user) throw new NotFoundException('Usuário não encontrado');
        return { ...user, circuitoName: found.name };
    }
}
