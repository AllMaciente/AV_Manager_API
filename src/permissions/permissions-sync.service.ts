import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { notInArray } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { permissions } from '../db/schema/permissions';
import { allPermissions } from './permissions.registry';

@Injectable()
export class PermissionsSync implements OnApplicationBootstrap {
  constructor(@Inject(DRIZZLE) private db: DB) { }

  async onApplicationBootstrap() {
    await this.db.transaction(async (tx) => {
      if (allPermissions.length > 0) {
        await tx
          .insert(permissions)
          .values(allPermissions.map((key) => ({ key })))
          .onConflictDoNothing({ target: permissions.key });
      }

      if (allPermissions.length > 0) {
        await tx
          .delete(permissions)
          .where(notInArray(permissions.key, allPermissions));
      } else {
        await tx.delete(permissions);
      }
    });
  }
}
