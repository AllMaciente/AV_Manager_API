import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { errorSchema, userListResponseSchema } from '../swagger/schemas';
import { listUsersQuerySchema } from './users.schemas';
import type { ListUsersQueryDto } from './users.schemas';
import { UsersService } from './users.service';
import { EquipamentosService } from 'src/equipamentos/equipamentos.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private users: UsersService,
        private equipamento: EquipamentosService
    ) { }

    @Get()
    @RequirePermissions('users.view')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Listar usuários',
        description:
            'Lista os usuários cadastrados com filtros opcionais. Requer a permissão users.view.',
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Busca por username, nome, sobrenome ou email',
        example: 'joao',
    })
    @ApiQuery({
        name: 'circuitoId',
        required: false,
        description: 'Filtra pelos usuários de um circuito',
        example: 'Aw_M6jP36B8F',
    })
    @ApiQuery({
        name: 'isAdmin',
        required: false,
        enum: ['true', 'false'],
        description: 'Filtra por administradores',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Página da listagem (padrão 1)',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Itens por página (padrão 20, máximo 100)',
        example: 20,
    })
    @ApiOkResponse({
        description: 'Usuários encontrados',
        schema: userListResponseSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.view',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findAll(
        @Query(new ZodValidationPipe(listUsersQuerySchema)) query: ListUsersQueryDto,
    ) {
        return this.users.findAll(query);
    }

    @Get(':id/equipamentos')
    @ApiParam({
        name: 'id',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @RequirePermissions('users.view')
    @UseGuards(PermissionsGuard)
    operators(@Param('id') id: string) {
        return this.equipamento.findEquipamentos(id)
    }
}
