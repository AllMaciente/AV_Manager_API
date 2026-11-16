import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { EquipamentosService } from './equipamentos.service';
import { PermissionsGuard, RequirePermissions } from 'src/permissions';
import { ZodValidationPipe } from 'src/common/zod-validation.pipe';
import {
    eligibleUsersQuerySchema,
    equipamentoBodySchema,
    setOrderBodySchema,
} from './equipamentos.schemas';
import type {
    eligibleUsersQueryDto,
    equipamentoBodyDto,
    setOrderBodyDto,
} from './equipamentos.schemas';
import {
    equipamentoBodySchema as equipamentoDocBodySchema,
    equipamentoListSchema,
    equipamentoResponseSchema,
    equipamentoUserListSchema,
    errorSchema,
    setEquipamentoOrderBodySchema,
    userEquipamentoLinkSchema,
    userEquipamentoListSchema,
} from 'src/swagger/schemas';

@ApiTags('equipamentos')
@ApiBearerAuth()
@Controller('equipamentos')
@UseGuards(JwtAuthGuard)
export class EquipamentosController {
    constructor(private equipamento: EquipamentosService) { }

    @Get()
    @ApiOperation({
        summary: 'Listar equipamentos',
        description: 'Lista todos os equipamentos cadastrados em ordem alfabética. Disponível para qualquer usuário autenticado.',
    })
    @ApiOkResponse({
        description: 'Lista de equipamentos',
        schema: equipamentoListSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findAll() {
        return this.equipamento.findAll();
    }

    @Get('me')
    @ApiOperation({
        summary: 'Listar meus equipamentos',
        description:
            'Lista os equipamentos do usuário autenticado, na ordem de preferência definida.',
    })
    @ApiOkResponse({
        description: 'Equipamentos do usuário autenticado',
        schema: userEquipamentoListSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findMine(@Req() req: any) {
        return this.equipamento.findEquipamentos(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar equipamento por ID' })
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'Aw_M6jP36B8F',
    })
    @ApiOkResponse({
        description: 'Equipamento encontrado',
        schema: equipamentoResponseSchema,
    })
    @ApiNotFoundResponse({ description: 'Equipamento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findOne(@Param('id') id: string) {
        return this.equipamento.findById(id)
    }

    @Post()
    @RequirePermissions('equipamentos.create')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Criar equipamento' })
    @ApiBody({ schema: equipamentoDocBodySchema })
    @ApiCreatedResponse({
        description: 'Equipamento criado',
        schema: equipamentoResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({
        description: 'Sem permissão equipamentos.create',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    create(@Body(new ZodValidationPipe(equipamentoBodySchema)) body: equipamentoBodyDto) {
        return this.equipamento.create(body)
    }

    @Patch('me')
    @ApiOperation({
        summary: 'Definir a ordem dos meus equipamentos',
        description:
            'Substitui a lista de equipamentos do usuário autenticado pela ordem informada. Com removerAusentes = true (padrão), os equipamentos que não estiverem na lista são desvinculados.',
    })
    @ApiBody({ schema: setEquipamentoOrderBodySchema })
    @ApiOkResponse({
        description: 'Equipamentos do usuário na nova ordem',
        schema: userEquipamentoListSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiNotFoundResponse({
        description: 'Usuário ou algum equipamento não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    setEquipamentosOrdem(
        @Req() req: any,
        @Body(new ZodValidationPipe(setOrderBodySchema)) body: setOrderBodyDto
    ) {
        const userId = req.user.id
        return this.equipamento.setEquipamentosOrdem(userId, body.equipamentoIds, body.removerAusentes)
    }

    @Patch('order/:userId')
    @RequirePermissions('equipamentos.setOrder')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Definir a ordem dos equipamentos de um usuário',
        description:
            'Substitui a lista de equipamentos do usuário informado pela ordem enviada. Com removerAusentes = true (padrão), os equipamentos que não estiverem na lista são desvinculados.',
    })
    @ApiParam({
        name: 'userId',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @ApiBody({ schema: setEquipamentoOrderBodySchema })
    @ApiOkResponse({
        description: 'Equipamentos do usuário na nova ordem',
        schema: userEquipamentoListSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({
        description: 'Sem permissão equipamentos.setOrder',
        schema: errorSchema,
    })
    @ApiNotFoundResponse({
        description: 'Usuário ou algum equipamento não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    setEquipamentosOrdemUser(
        @Req() req: any,
        @Param('userId') id: string,
        @Body(new ZodValidationPipe(setOrderBodySchema)) body: setOrderBodyDto
    ) {
        const userId = id
        return this.equipamento.setEquipamentosOrdem(userId, body.equipamentoIds, body.removerAusentes)
    }

    @Patch(':id')
    @RequirePermissions('equipamentos.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Editar equipamento' })
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'Aw_M6jP36B8F',
    })
    @ApiBody({ schema: equipamentoDocBodySchema })
    @ApiOkResponse({
        description: 'Equipamento atualizado',
        schema: equipamentoResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({
        description: 'Sem permissão equipamentos.edit',
        schema: errorSchema,
    })
    @ApiNotFoundResponse({ description: 'Equipamento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(equipamentoBodySchema)) body: equipamentoBodyDto
    ) {
        return this.equipamento.update(id, body)
    }

    @Delete(':id')
    @RequirePermissions('equipamentos.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Remover equipamento',
        description:
            'Remove o equipamento e os vínculos com usuários. Equipamentos usados em escalas não podem ser removidos.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'Aw_M6jP36B8F',
    })
    @ApiOkResponse({
        description: 'Equipamento removido',
        schema: equipamentoResponseSchema,
    })
    @ApiConflictResponse({
        description: 'Equipamento em uso em escalas',
        schema: errorSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão equipamentos.edit',
        schema: errorSchema,
    })
    @ApiNotFoundResponse({ description: 'Equipamento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    remove(@Param('id') id: string) {
        return this.equipamento.remove(id)
    }

    @Get(':id/users')
    @ApiOperation({
        summary: 'Listar usuários de um equipamento',
        description:
            'Lista os usuários vinculados ao equipamento, com a ordem de exibição e se sabem operá-lo.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'Aw_M6jP36B8F',
    })
    @RequirePermissions('users.view')
    @UseGuards(PermissionsGuard)
    @ApiOkResponse({
        description: 'Usuários vinculados ao equipamento',
        schema: equipamentoUserListSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.view',
        schema: errorSchema,
    })
    @ApiNotFoundResponse({ description: 'Equipamento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    operators(@Param('id') id: string) {
        return this.equipamento.findUsers(id)
    }

    @Get(':id/eligible-users')
    @ApiOperation({
        summary: 'Listar candidatos para um equipamento em um evento',
        description:
            'Lista os usuários que colocaram o equipamento nas preferências e pertencem a um dos circuitos do evento, ordenados pela posição de preferência.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'Aw_M6jP36B8F',
    })
    @ApiQuery({
        name: 'eventId',
        required: true,
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiOkResponse({
        description: 'Candidatos elegíveis, em ordem de preferência',
        schema: equipamentoUserListSchema,
    })
    @ApiNotFoundResponse({ description: 'Equipamento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    eligibleUsers(
        @Param('id') id: string,
        @Query(new ZodValidationPipe(eligibleUsersQuerySchema))
        query: eligibleUsersQueryDto,
    ) {
        return this.equipamento.findEligibleUsers(id, query.eventId)
    }

    @Patch(':id/know')
    @ApiOperation({
        summary: 'Marcar se sei operar um equipamento',
        description:
            'Atualiza o vínculo do usuário autenticado com o equipamento indicando se ele sabe operá-lo.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'Aw_M6jP36B8F',
    })
    @ApiQuery({
        name: 'know',
        required: false,
        type: Boolean,
        description: 'Indica se o usuário sabe operar o equipamento (padrão false)',
        example: true,
    })
    @ApiOkResponse({
        description: 'Vínculo atualizado',
        schema: userEquipamentoLinkSchema,
    })
    @ApiNotFoundResponse({ description: 'Vínculo não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    sabeOperar(
        @Req() req: any,
        @Param('id') id: string,
        @Query('know', new DefaultValuePipe(false), ParseBoolPipe) know: boolean,
    ) {
        const userId = req.user.id
        return this.equipamento.updateSabeOperar(userId, id, know)
    }
}
