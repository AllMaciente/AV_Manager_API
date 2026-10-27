import { SetMetadata } from '@nestjs/common';
import { Permission } from '../permissions.registry';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
