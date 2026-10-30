import { Module } from '@nestjs/common';
import { EquipamentosService } from './equipamentos.service';
import { EquipamentosController } from './equipamentos.controller';

@Module({
  providers: [EquipamentosService],
  controllers: [EquipamentosController]
})
export class EquipamentosModule {}
