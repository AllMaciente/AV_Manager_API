import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EquipamentosService } from 'src/equipamentos/equipamentos.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService, EquipamentosService],
    exports: [UsersService],
})
export class UsersModule { }
