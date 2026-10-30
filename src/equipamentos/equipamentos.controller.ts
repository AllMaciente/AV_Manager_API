import { Body, Controller, DefaultValuePipe, Get, Param, ParseBoolPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { EquipamentosService } from './equipamentos.service';
import { PermissionsGuard, RequirePermissions } from 'src/permissions';
import { ZodValidationPipe } from 'src/common/zod-validation.pipe';
import { equipamentoBodySchema, setOrderBodySchema } from './equipamentos.schemas';
import type { equipamentoBodyDto, setOrderBodyDto } from './equipamentos.schemas';



@ApiTags('equipamentos')
@ApiBearerAuth()
@Controller('equipamentos')
@UseGuards(JwtAuthGuard)
export class EquipamentosController {
    constructor(private equipamento: EquipamentosService) { }

    @Get()
    @ApiOperation({ summary: 'Buscar todos os equipamentos' })
    findAll() {
        return this.equipamento.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar equipamentos por ID' })
    findOne(@Param('id') id: string) {
        return this.equipamento.findById(id)
    }

    @Post()
    @RequirePermissions('equipamentos.create')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Criar equipamento' })
    create(@Body(new ZodValidationPipe(equipamentoBodySchema)) body: equipamentoBodyDto) {
        return this.equipamento.create(body)
    }

    @Patch('me')
    setEquipamentosOrdem(
        @Req() req: any,
        @Body(new ZodValidationPipe(setOrderBodySchema)) body: setOrderBodyDto
    ) {
        const userId = req.user.id
        return this.equipamento.setEquipamentosOrdem(userId, body.equipamentoIds, body.removerAusentes)
    }

    @Patch(':id')
    @RequirePermissions('equipamentos.edit')
    @UseGuards(PermissionsGuard)
    update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(equipamentoBodySchema)) body: equipamentoBodyDto
    ) {
        return this.equipamento.update(id, body)
    }

    @Get(':id/users')
    @ApiParam({
        name: 'id',
        description: 'ID do equipamento',
        example: 'V1StGXR8_Z5j',
    })
    @RequirePermissions('users.view')
    @UseGuards(PermissionsGuard)
    operators(@Param('id') id: string) {
        return this.equipamento.findUsers(id)
    }

    @Patch(':id/know')
    sabeOperar(
        @Req() req: any,
        @Param('id') id: string,
        @Query('know', new DefaultValuePipe(false), ParseBoolPipe) know: boolean,
    ) {
        const userId = req.user.id
        return this.equipamento.updateSabeOperar(userId, id, know)
    }
}
