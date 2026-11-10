import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { equipamentos, circuito, userEquipamentos, users } from 'src/db/schema';
import { and, asc, eq, inArray, notInArray, sql } from 'drizzle-orm';

type EquipamentoData = {
    name: string
}

@Injectable()
export class EquipamentosService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

    async findAll() {
        return this.db.select().from(equipamentos).orderBy(equipamentos.name)
    }

    async findById(id: string) {
        const [row] = await this.db
            .select()
            .from(equipamentos)
            .where(eq(equipamentos.id, id))
            .limit(1);
        if (!row) throw new NotFoundException('equipamento não encontrado');
        return row;
    }

    async create(data: EquipamentoData) {
        const [row] = await this.db
            .insert(equipamentos)
            .values(data)
            .returning();
        return row;
    }

    async update(id: string, data: EquipamentoData) {
        const [row] = await this.db
            .update(equipamentos)
            .set(data)
            .where(eq(equipamentos.id, id))
            .returning();

        if (!row) throw new NotFoundException('Equipamento não encontrado');
        return row;
    }

    async findUsers(equipamentoId: string) {
        await this.findById(equipamentoId);

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
                ordem: userEquipamentos.ordem,
                sabeOperar: userEquipamentos.sabeOperar,
            })
            .from(userEquipamentos)
            .innerJoin(users, eq(userEquipamentos.userId, users.id))
            .leftJoin(circuito, eq(circuito.id, users.circuitoId))
            .where(eq(userEquipamentos.equipamentoId, equipamentoId))
            .orderBy(asc(userEquipamentos.ordem));
    }

    async addEquipamento(userId: string, equipamentoId: string, sabeOperar = true) {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId));
        if (!user) throw new NotFoundException("Usuário não encontrado");

        const [equipamento] = await this.db
            .select({ id: equipamentos.id })
            .from(equipamentos)
            .where(eq(equipamentos.id, equipamentoId));
        if (!equipamento) throw new NotFoundException("Equipamento não encontrado");

        return this.db.transaction(async (tx) => {
            const [{ max }] = await tx
                .select({ max: sql<number>`coalesce(max(${userEquipamentos.ordem}), 0)` })
                .from(userEquipamentos)
                .where(eq(userEquipamentos.userId, userId));

            const [created] = await tx
                .insert(userEquipamentos)
                .values({ userId, equipamentoId, ordem: Number(max) + 1, sabeOperar })
                .onConflictDoNothing({
                    target: [userEquipamentos.userId, userEquipamentos.equipamentoId],
                })
                .returning();

            if (!created) throw new ConflictException("Usuário já possui esse equipamento");
            return created;
        });
    }
    async addEquipamentos(userId: string, equipamentoIds: string[], sabeOperar = true) {
        const ids = [...new Set(equipamentoIds)];
        if (ids.length === 0) throw new BadRequestException("Nenhum equipamento informado");

        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId));
        if (!user) throw new NotFoundException("Usuário não encontrado");

        const existentes = await this.db
            .select({ id: equipamentos.id })
            .from(equipamentos)
            .where(inArray(equipamentos.id, ids));
        if (existentes.length !== ids.length) {
            throw new NotFoundException("Algum equipamento não foi encontrado");
        }

        return this.db.transaction(async (tx) => {
            const [{ max }] = await tx
                .select({ max: sql<number>`coalesce(max(${userEquipamentos.ordem}), 0)` })
                .from(userEquipamentos)
                .where(eq(userEquipamentos.userId, userId));

            let ordem = Number(max);

            // onConflictDoNothing ignora os que o usuário já tem
            return tx
                .insert(userEquipamentos)
                .values(ids.map((equipamentoId) => ({
                    userId,
                    equipamentoId,
                    ordem: ++ordem,
                    sabeOperar,
                })))
                .onConflictDoNothing({
                    target: [userEquipamentos.userId, userEquipamentos.equipamentoId],
                })
                .returning();
        });
    }
    async findEquipamentos(userId: string) {
        return this.db
            .select({
                id: equipamentos.id,
                name: equipamentos.name,
                ordem: userEquipamentos.ordem,
                sabeOperar: userEquipamentos.sabeOperar,
            })
            .from(userEquipamentos)
            .innerJoin(equipamentos, eq(userEquipamentos.equipamentoId, equipamentos.id))
            .where(eq(userEquipamentos.userId, userId))
            .orderBy(asc(userEquipamentos.ordem));
    }

    async updateSabeOperar(userId: string, equipamentoId: string, sabeOperar: boolean) {
        const [updated] = await this.db
            .update(userEquipamentos)
            .set({ sabeOperar })
            .where(and(
                eq(userEquipamentos.userId, userId),
                eq(userEquipamentos.equipamentoId, equipamentoId),
            ))
            .returning();

        if (!updated) throw new NotFoundException("Vínculo não encontrado");
        return updated;
    }

    async removeEquipamento(userId: string, equipamentoId: string) {
        const [removed] = await this.db
            .delete(userEquipamentos)
            .where(and(
                eq(userEquipamentos.userId, userId),
                eq(userEquipamentos.equipamentoId, equipamentoId),
            ))
            .returning();

        if (!removed) throw new NotFoundException("Vínculo não encontrado");
        return removed;
    }
    async setEquipamentosOrdem(
        userId: string,
        equipamentoIds: string[],
        removerAusentes = true,
    ) {
        const ids = [...new Set(equipamentoIds)]; // remove duplicados mantendo a ordem

        if (ids.length === 0 && !removerAusentes) {
            throw new BadRequestException("Nenhum equipamento informado");
        }

        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId));
        if (!user) throw new NotFoundException("Usuário não encontrado");

        if (ids.length > 0) {
            const existentes = await this.db
                .select({ id: equipamentos.id })
                .from(equipamentos)
                .where(inArray(equipamentos.id, ids));
            if (existentes.length !== ids.length) {
                throw new NotFoundException("Algum equipamento não foi encontrado");
            }
        }

        await this.db.transaction(async (tx) => {
            if (ids.length > 0) {
                await tx
                    .insert(userEquipamentos)
                    .values(
                        ids.map((equipamentoId, i) => ({
                            userId,
                            equipamentoId,
                            ordem: i + 1,
                        })),
                    )
                    .onConflictDoUpdate({
                        target: [userEquipamentos.userId, userEquipamentos.equipamentoId],
                        set: { ordem: sql`excluded.ordem` }, // não mexe no sabeOperar
                    });
            }

            if (removerAusentes) {
                await tx
                    .delete(userEquipamentos)
                    .where(
                        ids.length > 0
                            ? and(
                                eq(userEquipamentos.userId, userId),
                                notInArray(userEquipamentos.equipamentoId, ids),
                            )
                            : eq(userEquipamentos.userId, userId),
                    );
            }
        });

        return this.findEquipamentos(userId); // aquela função que lista com ordem
    }
}
