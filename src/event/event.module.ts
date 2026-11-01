import { Module } from '@nestjs/common';
import { EventService } from './services/event.service';
import { EventDayService } from './services/event-day.service';
import { EventCircuitService } from './services/event-circuit.service';
import { RosterService } from './services/roster.service';
import { EventController } from './controllers/event.controller';
import { EventDayController } from './controllers/event-day.controller';
import { RosterController } from './controllers/roster.controller';

@Module({
  providers: [EventService, EventDayService, EventCircuitService, RosterService],
  controllers: [EventController, EventDayController, RosterController]
})
export class EventModule { }
