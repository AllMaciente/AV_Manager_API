import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db.module';
import { permissions, userPermissions, users } from '../db/schema';
import { allPermissions, Permission, PERMISSIONS } from './permissions.registry';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const filterPermissions = (keys: string[], pattern?: string) => {
  const sorted = [...keys].sort();

  if (!pattern) return sorted;

  const regex = new RegExp(
    `^${pattern.split('*').map(escapeRegExp).join('.*')}$`,
  );
  return sorted.filter((key) => regex.test(key));
};

@Injectable()
export class PermissionsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async getUserPermissionsView(userId: string, pattern?: string) {
    const user = await this.getUserOrThrow(userId);
    const keys = await this.getUserPermissionKeys(userId);

    return {
      userId: user.id,
      isAdmin: user.isAdmin,
      permissions: filterPermissions(keys, pattern),
    };
  }

  async replaceUserPermissions(userId: string, keys: string[]) {
    await this.getUserOrThrow(userId);

    const invalid = keys.filter(
      (key) => !allPermissions.includes(key as Permission),
    );

    if (invalid.length) {
      throw new BadRequestException(
        `Permissões inválidas: ${invalid.join(', ')}`,
      );
    }

    await this.setUserPermissions(userId, keys as Permission[]);
    return this.getUserPermissionsView(userId);
  }

  private async getUserOrThrow(userId: string) {
    const [user] = await this.db
      .select({ id: users.id, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async getUserPermissions(userId: string): Promise<Set<Permission>> {
    const rows = await this.db
      .select({ key: permissions.key })
      .from(userPermissions)
      .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
      .where(eq(userPermissions.userId, userId));

    return new Set(rows.map((r) => r.key as Permission));
  }

  async getUserPermissionKeys(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ key: permissions.key })
      .from(userPermissions)
      .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
      .where(eq(userPermissions.userId, userId));

    return rows.map((r) => r.key);
  }

  async setUserPermissions(userId: string, perms: Permission[]) {
    const keys = [...new Set(perms)];
    await this.db.transaction(async (tx) => {
      await tx
        .delete(userPermissions)
        .where(eq(userPermissions.userId, userId));
      if (!keys.length) return;

      const rows = await tx
        .select({ id: permissions.id })
        .from(permissions)
        .where(inArray(permissions.key, keys));

      if (rows.length) {
        await tx
          .insert(userPermissions)
          .values(rows.map((r) => ({ userId, permissionId: r.id })));
      }
    });
  }

  async addUserPermissions(userId: string, perms: Permission[]) {
    const keys = [...new Set(perms)];
    if (!keys.length) return;

    const existing = await this.db
      .select({ key: permissions.key })
      .from(userPermissions)
      .innerJoin(permissions, eq(permissions.id, userPermissions.permissionId))
      .where(eq(userPermissions.userId, userId));

    const existingKeys = new Set(existing.map((r) => r.key));
    const toAdd = keys.filter((k) => !existingKeys.has(k));

    if (!toAdd.length) return;

    const rows = await this.db
      .select({ id: permissions.id })
      .from(permissions)
      .where(inArray(permissions.key, toAdd));

    if (rows.length) {
      await this.db
        .insert(userPermissions)
        .values(rows.map((r) => ({ userId, permissionId: r.id })));
    }
  }

  async removeUserPermissions(userId: string, perms: Permission[]) {
    const keys = [...new Set(perms)];
    if (!keys.length) return;

    const rows = await this.db
      .select({ id: permissions.id })
      .from(permissions)
      .where(inArray(permissions.key, keys));

    if (!rows.length) return;

    const permissionIds = rows.map((r) => r.id);
    await this.db
      .delete(userPermissions)
      .where(
        and(
          eq(userPermissions.userId, userId),
          inArray(userPermissions.permissionId, permissionIds),
        ),
      );
  }
  async getPermissions() {
    return Object.entries(PERMISSIONS).map(([group, action]) => ({
      category: group,
      permissions: action.map((action) => `${group}.${action}`)
    }))
  }
}
