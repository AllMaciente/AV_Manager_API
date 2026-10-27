import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { circuitoBodySchema } from './circuitos.schemas';
import type { CircuitoBodyDto } from './circuitos.schemas';
import { CircuitosService } from './circuitos.service';
import {
    assignedUserSchema,
    circuitoBodySchema as circuitoDocBodySchema,
    circuitoListSchema,
    circuitoResponseSchema,
    circuitoUserListSchema,
    errorSchema,
} from '../swagger/schemas';

@ApiTags('circuitos')
@ApiBearerAuth()
@Controller('circuitos')
@UseGuards(JwtAuthGuard)
export class CircuitosController {
    constructor(private circuitos: CircuitosService) { }

    @Get()
    @ApiOperation({ summary: 'Listar circuitos' })
    @ApiOkResponse({
        description: 'Lista de circuitos',
        schema: circuitoListSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findAll() {
        return this.circuitos.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar circuito por ID' })
    @ApiParam({ name: 'id', description: 'ID do circuito', example: 'Aw_M6jP36B8F' })
    @ApiOkResponse({ schema: circuitoResponseSchema })
    @ApiNotFoundResponse({ description: 'Circuito não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findOne(@Param('id') id: string) {
        return this.circuitos.findById(id);
    }

    @Get(':id/users')
    @ApiOperation({ summary: 'Listar usuários de um circuito' })
    @ApiParam({ name: 'id', description: 'ID do circuito', example: 'Aw_M6jP36B8F' })
    @ApiOkResponse({
        description: 'Usuários vinculados ao circuito',
        schema: circuitoUserListSchema,
    })
    @ApiNotFoundResponse({ description: 'Circuito não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findUsers(@Param('id') id: string) {
        return this.circuitos.findUsers(id);
    }

    @Post()
    @RequirePermissions('circuito.create')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Criar circuito' })
    @ApiBody({ schema: circuitoDocBodySchema })
    @ApiCreatedResponse({ description: 'Circuito criado', schema: circuitoResponseSchema })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({ description: 'Sem permissão circuito.create', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    create(@Body(new ZodValidationPipe(circuitoBodySchema)) body: CircuitoBodyDto) {
        return this.circuitos.create(body);
    }

    @Patch(':id')
    @RequirePermissions('circuito.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Editar circuito' })
    @ApiParam({ name: 'id', description: 'ID do circuito', example: 'Aw_M6jP36B8F' })
    @ApiBody({ schema: circuitoDocBodySchema })
    @ApiOkResponse({ description: 'Circuito atualizado', schema: circuitoResponseSchema })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({ description: 'Sem permissão circuito.edit', schema: errorSchema })
    @ApiNotFoundResponse({ description: 'Circuito não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(circuitoBodySchema)) body: CircuitoBodyDto,
    ) {
        return this.circuitos.update(id, body);
    }

    @Patch(':id/users/:userId')
    @RequirePermissions('circuito.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Vincular um usuário ao circuito' })
    @ApiParam({ name: 'id', description: 'ID do circuito', example: 'Aw_M6jP36B8F' })
    @ApiParam({
        name: 'userId',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @ApiOkResponse({
        description: 'Usuário vinculado ao circuito',
        schema: assignedUserSchema,
    })
    @ApiForbiddenResponse({ description: 'Sem permissão circuito.edit', schema: errorSchema })
    @ApiNotFoundResponse({
        description: 'Circuito ou usuário não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    assignUser(@Param('id') id: string, @Param('userId') userId: string) {
        return this.circuitos.assignUser(id, userId);
    }
}
