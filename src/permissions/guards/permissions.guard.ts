import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../permissions.registry';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!required?.length) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    if (user.isAdmin) return true;

    const owned = await this.permissionsService.getUserPermissions(user.id);
    return required.every((permission) => owned.has(permission));
  }
}
