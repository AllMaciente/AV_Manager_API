import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionsService } from './permissions.service';
import { PermissionsSync } from './permissions-sync.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { UserPermissionsController } from './user-permissions.controller';
import { DbModule } from '../db/db.module';

@Global()
@Module({
  imports: [DbModule, AuthModule],
  controllers: [UserPermissionsController],
  providers: [PermissionsService, PermissionsSync, PermissionsGuard],
  exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
