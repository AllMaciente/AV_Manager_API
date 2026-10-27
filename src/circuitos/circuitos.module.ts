import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CircuitosController } from './circuitos.controller';
import { CircuitosService } from './circuitos.service';

@Module({
    imports: [AuthModule],
    controllers: [CircuitosController],
    providers: [CircuitosService],
})
export class CircuitosModule { }
