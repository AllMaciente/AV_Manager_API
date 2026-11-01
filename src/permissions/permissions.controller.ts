import { Controller, Get, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions } from './decorators';
import { PermissionsGuard } from './guards';
import { errorSchema, permissionCatalogSchema } from '../swagger/schemas';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
    constructor(private permissions: PermissionsService) { }

    @Get()
    @RequirePermissions('users.viewPerm')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Listar o catálogo de permissões',
        description:
            'Retorna todas as permissões disponíveis agrupadas por categoria. Requer a permissão users.viewPerm.',
    })
    @ApiOkResponse({
        description: 'Catálogo de permissões',
        schema: permissionCatalogSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.viewPerm',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    getPermissions() {
        return this.permissions.getPermissions()
    }
}
