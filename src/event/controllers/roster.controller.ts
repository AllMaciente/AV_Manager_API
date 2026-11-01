import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { ZodValidationPipe } from 'src/common/zod-validation.pipe';
import { PermissionsGuard, RequirePermissions } from 'src/permissions';
import {
  errorSchema,
  rosterBodySchema,
  rosterListResponseSchema,
  rosterResponseSchema,
  rosterUpdateBodySchema,
} from 'src/swagger/schemas';
import { RosterService } from '../services/roster.service';
import {
  createRosterSchema,
  listMyRostersQuerySchema,
  listRostersQuerySchema,
  updateRosterSchema,
} from '../schemas/roster.schema';
import type {
  createRosterDto,
  listMyRostersQueryDto,
  listRostersQueryDto,
  updateRosterDto,
} from '../schemas/roster.schema';

type AuthenticatedRequest = {
  user: { id: string };
};

@ApiTags('roster')
@ApiBearerAuth()
@Controller('roster')
@UseGuards(JwtAuthGuard)
export class RosterController {
  constructor(private rosters: RosterService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar escalas',
    description:
      'Lista as escalas com filtros e paginação. Disponível para qualquer usuário autenticado.',
  })
  @ApiQuery({
    name: 'eventId',
    required: false,
    description: 'Filtra pelo evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filtra pela data (AAAA-MM-DD)',
    example: '2026-11-01',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['MORNING', 'AFTERNOON'],
    description: 'Filtra pelo período',
  })
  @ApiQuery({
    name: 'equipamentoId',
    required: false,
    description: 'Filtra pelo equipamento',
    example: 'Aw_M6jP36B8F',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtra pelo usuário escalado',
    example: 'V1StGXR8_Z5j',
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
    description: 'Escalas encontradas',
    schema: rosterListResponseSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  findAll(
    @Query(new ZodValidationPipe(listRostersQuerySchema))
    query: listRostersQueryDto,
  ) {
    return this.rosters.findAll(query);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Minhas escalas',
    description:
      'Lista as escalas do usuário autenticado. Por padrão retorna apenas de hoje em diante, em ordem cronológica.',
  })
  @ApiQuery({
    name: 'includePast',
    required: false,
    enum: ['true', 'false'],
    description: 'Inclui escalas passadas (padrão false)',
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
    description: 'Escalas do usuário autenticado',
    schema: rosterListResponseSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  findMine(
    @Req() req: AuthenticatedRequest,
    @Query(new ZodValidationPipe(listMyRostersQuerySchema))
    query: listMyRostersQueryDto,
  ) {
    return this.rosters.findMine(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar escala por ID',
    description: 'Disponível para qualquer usuário autenticado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da escala',
    example: 'V1StGXR8_Z5j',
  })
  @ApiOkResponse({
    description: 'Escala encontrada',
    schema: rosterResponseSchema,
  })
  @ApiNotFoundResponse({
    description: 'Escala não encontrada',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  findOne(@Param('id') id: string) {
    return this.rosters.findById(id);
  }

  @Post()
  @RequirePermissions('roster.create')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Escalar usuário em um dia e período' })
  @ApiBody({ schema: rosterBodySchema })
  @ApiCreatedResponse({
    description: 'Escala criada',
    schema: rosterResponseSchema,
  })
  @ApiBadRequestResponse({ schema: errorSchema })
  @ApiConflictResponse({
    description: 'Usuário já está escalado neste período',
    schema: errorSchema,
  })
  @ApiForbiddenResponse({
    description: 'Sem permissão roster.create',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Dia do evento, equipamento ou usuário não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  create(
    @Body(new ZodValidationPipe(createRosterSchema)) body: createRosterDto,
  ) {
    return this.rosters.create(body);
  }

  @Patch(':id')
  @RequirePermissions('roster.edit')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Editar escala',
    description:
      'Atualiza os campos informados, permitindo trocar dia, período, equipamento ou usuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da escala',
    example: 'V1StGXR8_Z5j',
  })
  @ApiBody({ schema: rosterUpdateBodySchema })
  @ApiOkResponse({
    description: 'Escala atualizada',
    schema: rosterResponseSchema,
  })
  @ApiBadRequestResponse({ schema: errorSchema })
  @ApiConflictResponse({
    description: 'Usuário já está escalado neste período',
    schema: errorSchema,
  })
  @ApiForbiddenResponse({
    description: 'Sem permissão roster.edit',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Escala, dia do evento, equipamento ou usuário não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRosterSchema)) body: updateRosterDto,
  ) {
    return this.rosters.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('roster.edit')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Remover escala' })
  @ApiParam({
    name: 'id',
    description: 'ID da escala',
    example: 'V1StGXR8_Z5j',
  })
  @ApiOkResponse({ description: 'Escala removida' })
  @ApiForbiddenResponse({
    description: 'Sem permissão roster.edit',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Escala não encontrada',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  remove(@Param('id') id: string) {
    return this.rosters.remove(id);
  }
}
