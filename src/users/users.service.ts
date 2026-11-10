import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { and, asc, eq, getTableColumns, ilike, ne, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { circuito, equipamentos, userEquipamentos, users } from '../db/schema';
import type { ListUsersQueryDto } from './users.schemas';

export type CreateUserData = {
    username: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    password: string;
    isAdmin?: boolean;
    circuitoId?: string;
};

export type UpdateUserData = {
    username?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    email?: string | null;
    circuitoId?: string | null;
};

const userSummaryColumns = {
    id: users.id,
    username: users.username,
    firstName: users.firstName,
    middleName: users.middleName,
    lastName: users.lastName,
    email: users.email,
    isAdmin: users.isAdmin,
    circuitoId: users.circuitoId,
    createdAt: users.createdAt,
};

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

    async count(): Promise<number> {
        const result = await this.db.select({ count: sql<number>`count(*)` }).from(users);
        return Number(result[0]?.count ?? 0);
    }

    async findAll({ search, circuitoId, isAdmin, page, limit }: ListUsersQueryDto) {
        const conditions: SQL[] = [];

        if (circuitoId) {
            conditions.push(eq(users.circuitoId, circuitoId));
        }

        if (isAdmin !== undefined) {
            conditions.push(eq(users.isAdmin, isAdmin));
        }

        if (search) {
            const term = `%${search}%`;
            conditions.push(
                or(
                    ilike(users.username, term),
                    ilike(users.firstName, term),
                    ilike(users.middleName, term),
                    ilike(users.lastName, term),
                    ilike(users.email, term),
                )!,
            );
        }

        const where = conditions.length ? and(...conditions) : undefined;

        const [items, totalResult] = await Promise.all([
            this.db
                .select({
                    ...userSummaryColumns,
                    circuitoName: circuito.name,
                })
                .from(users)
                .leftJoin(circuito, eq(circuito.id, users.circuitoId))
                .where(where)
                .orderBy(users.username)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(users)
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
        const [user] = await this.db
            .select({
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                middleName: users.middleName,
                lastName: users.lastName,
                email: users.email,
                password: users.password,
                emailVerifiedAt: users.emailVerifiedAt,
                createdAt: users.createdAt,
                isAdmin: users.isAdmin,
                circuitoId: users.circuitoId,
                circuitoName: circuito.name,
            })
            .from(users)
            .leftJoin(circuito, eq(users.circuitoId, circuito.id))
            .where(eq(users.id, id))
            .limit(1);
        return user;
    }

    async findByEmail(email: string) {
        const [user] = await this.db
            .select({
                ...getTableColumns(users),
                circuitoName: circuito.name,
            })
            .from(users)
            .leftJoin(circuito, eq(users.circuitoId, circuito.id))
            .where(sql`lower(${users.email}) = lower(${email})`)
            .limit(1);
        return user;
    }

    async findByUsername(username: string) {
        const [user] = await this.db
            .select({
                ...getTableColumns(users),
                circuitoName: circuito.name,
            })
            .from(users)
            .leftJoin(circuito, eq(users.circuitoId, circuito.id))
            .where(sql`lower(${users.username}) = lower(${username})`)
            .limit(1);
        return user;
    }

    async findByUsernameOrEmail(username: string, email?: string) {
        const conditions = [sql`lower(${users.username}) = lower(${username})`];

        if (email) {
            conditions.push(sql`lower(${users.email}) = lower(${email})`);
        }

        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(or(...conditions))
            .limit(1);
        return user;
    }

    async create(data: CreateUserData) {
        let circuitoName: string | null = null;

        if (data.circuitoId) {
            const [existingCircuito] = await this.db
                .select({ id: circuito.id, name: circuito.name })
                .from(circuito)
                .where(eq(circuito.id, data.circuitoId))
                .limit(1);

            if (!existingCircuito) {
                throw new BadRequestException('Circuito não encontrado');
            }

            circuitoName = existingCircuito.name;
        }

        const [user] = await this.db
            .insert(users)
            .values({
                username: data.username,
                firstName: data.firstName,
                middleName: data.middleName ?? null,
                lastName: data.lastName,
                email: data.email ?? null,
                password: data.password,
                isAdmin: data.isAdmin ?? false,
                circuitoId: data.circuitoId ?? null,
            })
            .returning({
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                middleName: users.middleName,
                lastName: users.lastName,
                email: users.email,
                isAdmin: users.isAdmin,
                circuitoId: users.circuitoId,
            });
        return { ...user, circuitoName };
    }

    async update(id: string, data: UpdateUserData) {
        await this.ensureUserExists(id);
        await this.ensureUniqueFields(id, data);

        if (data.circuitoId) {
            await this.ensureCircuitoExists(data.circuitoId);
        }

        await this.db.update(users).set(data).where(eq(users.id, id));

        return this.findPublicById(id);
    }

    async changePassword(
        id: string,
        currentPassword: string,
        newPassword: string,
    ) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('Usuário não encontrado');

        const valid = await argon2.verify(user.password, currentPassword);
        if (!valid) throw new BadRequestException('Senha atual incorreta');

        await this.setPassword(id, newPassword);

        return { message: 'Senha alterada com sucesso' };
    }

    async resetPassword(id: string, newPassword: string) {
        await this.ensureUserExists(id);
        await this.setPassword(id, newPassword);

        return { message: 'Senha alterada com sucesso' };
    }

    async findPublicById(id: string) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('Usuário não encontrado');

        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            emailVerifiedAt: user.emailVerifiedAt,
            createdAt: user.createdAt,
            isAdmin: user.isAdmin,
            circuitoId: user.circuitoId,
            circuitoName: user.circuitoName,
        };
    }

    private async setPassword(id: string, newPassword: string) {
        const hash = await argon2.hash(newPassword);
        await this.db
            .update(users)
            .set({ password: hash })
            .where(eq(users.id, id));
    }

    private async ensureUserExists(id: string) {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!user) throw new NotFoundException('Usuário não encontrado');
    }

    private async ensureUniqueFields(id: string, data: UpdateUserData) {
        if (data.username) {
            const [existing] = await this.db
                .select({ id: users.id })
                .from(users)
                .where(
                    and(
                        sql`lower(${users.username}) = lower(${data.username})`,
                        ne(users.id, id),
                    ),
                )
                .limit(1);

            if (existing) throw new ConflictException('Username já cadastrado');
        }

        if (data.email) {
            const [existing] = await this.db
                .select({ id: users.id })
                .from(users)
                .where(
                    and(
                        sql`lower(${users.email}) = lower(${data.email})`,
                        ne(users.id, id),
                    ),
                )
                .limit(1);

            if (existing) throw new ConflictException('Email já cadastrado');
        }
    }

    private async ensureCircuitoExists(circuitoId: string) {
        const [existing] = await this.db
            .select({ id: circuito.id })
            .from(circuito)
            .where(eq(circuito.id, circuitoId))
            .limit(1);

        if (!existing) {
            throw new BadRequestException('Circuito não encontrado');
        }
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
}
