import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions } from './decorators';
import { PermissionsGuard } from './guards';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
    constructor(private permissions: PermissionsService) { }

    @Get()
    @RequirePermissions('users.viewPerm')
    @UseGuards(PermissionsGuard)
    getPermissions() {
        return this.permissions.getPermissions()
    }
}
