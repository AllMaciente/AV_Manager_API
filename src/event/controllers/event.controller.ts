import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
    eventBodySchema,
    eventCircuitBodySchema,
    eventCircuitLinkSchema,
    eventCircuitResponseSchema,
    eventCircuitWithCircuitSchema,
    eventCircuitWithEventSchema,
    eventListResponseSchema,
    eventResponseSchema,
} from 'src/swagger/schemas';
import { EventCircuitService } from '../services/event-circuit.service';
import { EventService } from '../services/event.service';
import {
    EventSchema,
    eventCircuitBodySchema as eventCircuitZodSchema,
    listEventsQuerySchema,
} from '../schemas/event.schema';
import type {
    EventDto,
    eventCircuitBodyDto,
    listEventsQueryDto,
} from '../schemas/event.schema';

@ApiTags('event')
@ApiBearerAuth()
@Controller('event')
@UseGuards(JwtAuthGuard)
export class EventController {
    constructor(
        private events: EventService,
        private eventCircuits: EventCircuitService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Listar eventos',
        description: 'Lista os eventos com circuitos e dias vinculados, com busca e paginação.',
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Busca pelo nome do evento',
        example: 'culto',
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
        description: 'Eventos encontrados',
        schema: eventListResponseSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findAll(
        @Query(new ZodValidationPipe(listEventsQuerySchema)) query: listEventsQueryDto,
    ) {
        return this.events.findAllEvents(query);
    }

    @Get('circuits/:circuitId')
    @ApiOperation({
        summary: 'Listar eventos de um circuito',
        description: 'Retorna os vínculos entre um circuito e seus eventos.',
    })
    @ApiParam({
        name: 'circuitId',
        description: 'ID do circuito',
        example: 'Aw_M6jP36B8F',
    })
    @ApiOkResponse({
        description: 'Eventos vinculados ao circuito',
        schema: { type: 'array', items: eventCircuitWithEventSchema },
    })
    @ApiNotFoundResponse({ description: 'Circuito não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findEventsByCircuit(@Param('circuitId') circuitId: string) {
        return this.eventCircuits.findByCircuit(circuitId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar evento por ID' })
    @ApiParam({
        name: 'id',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiOkResponse({
        description: 'Evento encontrado',
        schema: eventResponseSchema,
    })
    @ApiNotFoundResponse({ description: 'Evento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findOne(@Param('id') id: string) {
        return this.events.findById(id);
    }

    @Post()
    @RequirePermissions('event.create')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Criar evento',
        description: 'Cria um evento e, opcionalmente, vincula circuitos a ele.',
    })
    @ApiBody({ schema: eventBodySchema })
    @ApiCreatedResponse({
        description: 'Evento criado',
        schema: eventResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({ description: 'Sem permissão event.create', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    create(@Body(new ZodValidationPipe(EventSchema)) body: EventDto) {
        return this.events.create(body);
    }

    @Patch(':id')
    @RequirePermissions('event.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Editar evento',
        description:
            'Atualiza os dados do evento. Se circuitoId for enviado, substitui os circuitos vinculados.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiBody({ schema: eventBodySchema })
    @ApiOkResponse({
        description: 'Evento atualizado',
        schema: eventResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({ description: 'Sem permissão event.edit', schema: errorSchema })
    @ApiNotFoundResponse({ description: 'Evento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(EventSchema)) body: EventDto,
    ) {
        return this.events.update(id, body);
    }

    @Get(':eventId/circuits')
    @ApiOperation({ summary: 'Listar circuitos de um evento' })
    @ApiParam({
        name: 'eventId',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiOkResponse({
        description: 'Circuitos vinculados ao evento',
        schema: { type: 'array', items: eventCircuitWithCircuitSchema },
    })
    @ApiNotFoundResponse({ description: 'Evento não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findCircuits(@Param('eventId') eventId: string) {
        return this.eventCircuits.findByEvent(eventId);
    }

    @Get(':eventId/circuits/:circuitId')
    @ApiOperation({ summary: 'Buscar vínculo entre evento e circuito' })
    @ApiParam({
        name: 'eventId',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiParam({
        name: 'circuitId',
        description: 'ID do circuito',
        example: 'Aw_M6jP36B8F',
    })
    @ApiOkResponse({
        description: 'Vínculo encontrado',
        schema: eventCircuitResponseSchema,
    })
    @ApiNotFoundResponse({
        description: 'Vínculo entre evento e circuito não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findCircuitLink(
        @Param('eventId') eventId: string,
        @Param('circuitId') circuitId: string,
    ) {
        return this.eventCircuits.findOne(eventId, circuitId);
    }

    @Post(':eventId/circuits')
    @RequirePermissions('event.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Vincular circuito a um evento' })
    @ApiParam({
        name: 'eventId',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiBody({ schema: eventCircuitBodySchema })
    @ApiCreatedResponse({
        description: 'Circuito vinculado ao evento',
        schema: eventCircuitResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiConflictResponse({
        description: 'Circuito já vinculado a este evento',
        schema: errorSchema,
    })
    @ApiForbiddenResponse({ description: 'Sem permissão event.edit', schema: errorSchema })
    @ApiNotFoundResponse({
        description: 'Evento ou circuito não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    linkCircuit(
        @Param('eventId') eventId: string,
        @Body(new ZodValidationPipe(eventCircuitZodSchema)) body: eventCircuitBodyDto,
    ) {
        return this.eventCircuits.create({ eventId, circuitId: body.circuitId });
    }

    @Patch(':eventId/circuits/:circuitId')
    @RequirePermissions('event.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Trocar o circuito de um vínculo',
        description: 'Substitui o circuito vinculado ao evento por outro circuito.',
    })
    @ApiParam({
        name: 'eventId',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiParam({
        name: 'circuitId',
        description: 'ID do circuito atualmente vinculado',
        example: 'Aw_M6jP36B8F',
    })
    @ApiBody({ schema: eventCircuitBodySchema })
    @ApiOkResponse({
        description: 'Vínculo atualizado',
        schema: eventCircuitResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiConflictResponse({
        description: 'Circuito já vinculado a este evento',
        schema: errorSchema,
    })
    @ApiForbiddenResponse({ description: 'Sem permissão event.edit', schema: errorSchema })
    @ApiNotFoundResponse({
        description: 'Vínculo, evento ou circuito não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    updateCircuitLink(
        @Param('eventId') eventId: string,
        @Param('circuitId') circuitId: string,
        @Body(new ZodValidationPipe(eventCircuitZodSchema)) body: eventCircuitBodyDto,
    ) {
        return this.eventCircuits.update(eventId, circuitId, body);
    }

    @Delete(':eventId/circuits/:circuitId')
    @RequirePermissions('event.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Desvincular circuito de um evento' })
    @ApiParam({
        name: 'eventId',
        description: 'ID do evento',
        example: 'V1StGXR8_Z5j',
    })
    @ApiParam({
        name: 'circuitId',
        description: 'ID do circuito',
        example: 'Aw_M6jP36B8F',
    })
    @ApiOkResponse({
        description: 'Vínculo removido',
        schema: eventCircuitLinkSchema,
    })
    @ApiForbiddenResponse({ description: 'Sem permissão event.edit', schema: errorSchema })
    @ApiNotFoundResponse({
        description: 'Vínculo entre evento e circuito não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    removeCircuitLink(
        @Param('eventId') eventId: string,
        @Param('circuitId') circuitId: string,
    ) {
        return this.eventCircuits.remove(eventId, circuitId);
    }
}
