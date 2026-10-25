import { Inject, Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { users } from '../db/schema';

@Injectable()
export class UsersService {
    constructor(@Inject(DRIZZLE) private db: DB) { }

    async findById(id: string) {
        const [user] = await this.db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
                password: users.password,
                emailVerifiedAt: users.emailVerifiedAt,
                createdAt: users.createdAt,
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
            .where(eq(users.email, email))
            .limit(1);
        return user;
    }

    async findByEmailOrUsername(email: string, username: string) {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(or(eq(users.email, email), eq(users.username, username)))
            .limit(1);
        return user;
    }

    async create(data: { username: string; email: string; password: string }) {
        const [user] = await this.db
            .insert(users)
            .values(data)
            .returning({ id: users.id, username: users.username, email: users.email });
        return user;
    }
}
