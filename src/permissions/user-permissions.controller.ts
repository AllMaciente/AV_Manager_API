import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';
import { setPermissionsSchema } from './permissions.schemas';
import type { SetPermissionsDto } from './permissions.schemas';
import { PermissionsService } from './permissions.service';
import {
    errorSchema,
    patternQueryDescription,
    permissionsViewSchema,
    setPermissionsBodySchema,
} from '../swagger/schemas';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserPermissionsController {
    constructor(private permissions: PermissionsService) { }

    @Get('me/permissions')
    @ApiOperation({ summary: 'Ver as próprias permissões' })
    @ApiQuery({
        name: 'pattern',
        required: false,
        description: patternQueryDescription,
        example: 'circuito.*',
    })
    @ApiOkResponse({
        description: 'Permissões do usuário autenticado',
        schema: permissionsViewSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    getMine(@Req() req: any, @Query('pattern') pattern?: string) {
        return this.permissions.getUserPermissionsView(
            req.user.id,
            pattern?.trim() || undefined,
        );
    }

    @Get(':userId/permissions')
    @RequirePermissions('users.viewPerm')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Ver permissões de outro usuário' })
    @ApiParam({
        name: 'userId',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @ApiQuery({
        name: 'pattern',
        required: false,
        description: patternQueryDescription,
        example: 'circuito.*',
    })
    @ApiOkResponse({
        description: 'Permissões do usuário informado',
        schema: permissionsViewSchema,
    })
    @ApiForbiddenResponse({ description: 'Sem permissão users.viewPerm', schema: errorSchema })
    @ApiNotFoundResponse({ description: 'Usuário não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    getFromUser(
        @Param('userId') userId: string,
        @Query('pattern') pattern?: string,
    ) {
        return this.permissions.getUserPermissionsView(
            userId,
            pattern?.trim() || undefined,
        );
    }

    @Put('me/permissions')
    @RequirePermissions('users.setPerm')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Substituir as próprias permissões' })
    @ApiBody({ schema: setPermissionsBodySchema })
    @ApiOkResponse({
        description: 'Permissões atualizadas',
        schema: permissionsViewSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({ description: 'Sem permissão users.setPerm', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    replaceMine(
        @Req() req: any,
        @Body(new ZodValidationPipe(setPermissionsSchema)) body: SetPermissionsDto,
    ) {
        return this.permissions.replaceUserPermissions(
            req.user.id,
            body.permissions,
        );
    }

    @Put(':userId/permissions')
    @RequirePermissions('users.setPerm')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Substituir permissões de outro usuário' })
    @ApiParam({
        name: 'userId',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @ApiBody({ schema: setPermissionsBodySchema })
    @ApiOkResponse({
        description: 'Permissões atualizadas',
        schema: permissionsViewSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({ description: 'Sem permissão users.setPerm', schema: errorSchema })
    @ApiNotFoundResponse({ description: 'Usuário não encontrado', schema: errorSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    replace(
        @Param('userId') userId: string,
        @Body(new ZodValidationPipe(setPermissionsSchema)) body: SetPermissionsDto,
    ) {
        return this.permissions.replaceUserPermissions(userId, body.permissions);
    }
}
