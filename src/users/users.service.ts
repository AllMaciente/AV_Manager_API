import { Inject, Injectable } from '@nestjs/common';
import { eq, or, sql } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { users } from '../db/schema';

export type CreateUserData = {
    username: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    password: string;
};

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

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
        const [user] = await this.db
            .insert(users)
            .values(data)
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
