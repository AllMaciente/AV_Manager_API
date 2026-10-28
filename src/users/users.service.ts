import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { circuito, users } from '../db/schema';
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
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return user;
    }

    async findByEmail(email: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email})`)
            .limit(1);
        return user;
    }

    async findByUsername(username: string) {
        const [user] = await this.db
            .select()
            .from(users)
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
        if (data.circuitoId) {
            const [existingCircuito] = await this.db
                .select({ id: circuito.id })
                .from(circuito)
                .where(eq(circuito.id, data.circuitoId))
                .limit(1);

            if (!existingCircuito) {
                throw new BadRequestException('Circuito não encontrado');
            }
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
        return user;
    }
}
