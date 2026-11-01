import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './relations';

export const DRIZZLE = Symbol('DRIZZLE');

const createDb = () => drizzle({ connection: process.env.DATABASE_URL!, relations });

export type DB = ReturnType<typeof createDb>;

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            useFactory: (): DB => createDb(),
        },
    ],
    exports: [DRIZZLE],
})
export class DbModule { }