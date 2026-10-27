import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Verificar se a API está no ar' })
  @ApiOkResponse({
    description: 'API respondendo',
    schema: { type: 'string', example: 'pong' },
  })
  ping(): string {
    return this.appService.ping();
  }
}
