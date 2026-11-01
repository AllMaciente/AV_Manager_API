import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { ZodValidationPipe } from 'src/common/zod-validation.pipe';
import { PermissionsGuard, RequirePermissions } from 'src/permissions';
import {
  errorSchema,
  eventDayBatchBodySchema,
  eventDayBodySchema,
  eventDayListSchema,
  eventDayUpdateBodySchema,
  eventDayWithRostersSchema,
} from 'src/swagger/schemas';
import { EventDayService } from '../services/event-day.service';
import {
  createEventDayBatchBodySchema,
  createEventDayBodySchema,
  updateEventDaySchema,
} from '../schemas/event-day.schema';
import type {
  createEventDayBatchBodyDto,
  createEventDayBodyDto,
  updateEventDayDto,
} from '../schemas/event-day.schema';

@ApiTags('event')
@ApiBearerAuth()
@Controller('events/:eventId/days')
@UseGuards(JwtAuthGuard)
export class EventDayController {
  constructor(private days: EventDayService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar dias de um evento',
    description:
      'Lista os dias do evento com as escalas de cada dia. Disponível para qualquer usuário autenticado.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiOkResponse({
    description: 'Dias do evento',
    schema: eventDayListSchema,
  })
  @ApiNotFoundResponse({
    description: 'Evento não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  findAll(@Param('eventId') eventId: string) {
    return this.days.getDays(eventId);
  }

  @Get(':date')
  @ApiOperation({
    summary: 'Buscar dia de um evento',
    description:
      'Retorna um dia do evento com as escalas. Disponível para qualquer usuário autenticado.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiParam({
    name: 'date',
    description: 'Data do dia do evento (AAAA-MM-DD)',
    example: '2026-11-01',
  })
  @ApiOkResponse({
    description: 'Dia encontrado',
    schema: eventDayWithRostersSchema,
  })
  @ApiNotFoundResponse({
    description: 'Dia do evento não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  findOne(@Param('eventId') eventId: string, @Param('date') date: string) {
    return this.days.getDay(eventId, date);
  }

  @Post()
  @RequirePermissions('event.create')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Cadastrar dia de um evento' })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiBody({ schema: eventDayBodySchema })
  @ApiCreatedResponse({
    description: 'Dia cadastrado',
    schema: eventDayWithRostersSchema,
  })
  @ApiBadRequestResponse({ schema: errorSchema })
  @ApiConflictResponse({
    description: 'Dia já cadastrado para este evento',
    schema: errorSchema,
  })
  @ApiForbiddenResponse({
    description: 'Sem permissão event.create',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Evento não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  create(
    @Param('eventId') eventId: string,
    @Body(new ZodValidationPipe(createEventDayBodySchema))
    body: createEventDayBodyDto,
  ) {
    return this.days.createOne({ eventId, ...body });
  }

  @Post('batch')
  @RequirePermissions('event.create')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Cadastrar vários dias de um evento',
    description:
      'Cadastra vários dias de uma vez. Datas já cadastradas são ignoradas.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiBody({ schema: eventDayBatchBodySchema })
  @ApiCreatedResponse({
    description: 'Dias cadastrados',
    schema: { type: 'array', items: eventDayWithRostersSchema },
  })
  @ApiBadRequestResponse({ schema: errorSchema })
  @ApiForbiddenResponse({
    description: 'Sem permissão event.create',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Evento não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  createMany(
    @Param('eventId') eventId: string,
    @Body(new ZodValidationPipe(createEventDayBatchBodySchema))
    body: createEventDayBatchBodyDto,
  ) {
    return this.days.createMany(body.map((day) => ({ eventId, ...day })));
  }

  @Patch(':date')
  @RequirePermissions('event.edit')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Editar dia de um evento',
    description:
      'Atualiza a descrição do dia. A data e o evento não podem ser alterados.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiParam({
    name: 'date',
    description: 'Data do dia do evento (AAAA-MM-DD)',
    example: '2026-11-01',
  })
  @ApiBody({ schema: eventDayUpdateBodySchema })
  @ApiOkResponse({
    description: 'Dia atualizado',
    schema: eventDayWithRostersSchema,
  })
  @ApiBadRequestResponse({ schema: errorSchema })
  @ApiForbiddenResponse({
    description: 'Sem permissão event.edit',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Dia do evento não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  update(
    @Param('eventId') eventId: string,
    @Param('date') date: string,
    @Body(new ZodValidationPipe(updateEventDaySchema)) body: updateEventDayDto,
  ) {
    return this.days.update(eventId, date, body);
  }

  @Delete(':date')
  @RequirePermissions('event.edit')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Remover dia de um evento',
    description: 'Remove o dia e, em cascata, as escalas vinculadas a ele.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID do evento',
    example: 'V1StGXR8_Z5j',
  })
  @ApiParam({
    name: 'date',
    description: 'Data do dia do evento (AAAA-MM-DD)',
    example: '2026-11-01',
  })
  @ApiOkResponse({ description: 'Dia removido' })
  @ApiForbiddenResponse({
    description: 'Sem permissão event.edit',
    schema: errorSchema,
  })
  @ApiNotFoundResponse({
    description: 'Dia do evento não encontrado',
    schema: errorSchema,
  })
  @ApiUnauthorizedResponse({ schema: errorSchema })
  remove(@Param('eventId') eventId: string, @Param('date') date: string) {
    return this.days.remove(eventId, date);
  }
}
