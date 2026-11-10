import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
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
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import {
    changePasswordBodySchema,
    errorSchema,
    messageResponseSchema,
    resetPasswordBodySchema,
    updateProfileBodySchema,
    updateUserBodySchema,
    userEquipamentoListSchema,
    userListResponseSchema,
    userProfileSchema,
} from '../swagger/schemas';
import {
    changePasswordSchema,
    listUsersQuerySchema,
    resetPasswordSchema,
    updateProfileSchema,
    updateUserSchema,
} from './users.schemas';
import type {
    ChangePasswordDto,
    ListUsersQueryDto,
    ResetPasswordDto,
    UpdateProfileDto,
    UpdateUserDto,
} from './users.schemas';
import { UsersService } from './users.service';
import { EquipamentosService } from 'src/equipamentos/equipamentos.service';

type AuthenticatedRequest = {
    user: { id: string };
};

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private users: UsersService,
        private equipamento: EquipamentosService
    ) { }

    @Get()
    @RequirePermissions('users.view')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Listar usuários',
        description:
            'Lista os usuários cadastrados com filtros opcionais. Requer a permissão users.view.',
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Busca por username, nome, sobrenome ou email',
        example: 'joao',
    })
    @ApiQuery({
        name: 'circuitoId',
        required: false,
        description: 'Filtra pelos usuários de um circuito',
        example: 'Aw_M6jP36B8F',
    })
    @ApiQuery({
        name: 'isAdmin',
        required: false,
        enum: ['true', 'false'],
        description: 'Filtra por administradores',
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
        description: 'Usuários encontrados',
        schema: userListResponseSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.view',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    findAll(
        @Query(new ZodValidationPipe(listUsersQuerySchema)) query: ListUsersQueryDto,
    ) {
        return this.users.findAll(query);
    }

    @Patch('me')
    @ApiOperation({
        summary: 'Atualizar o próprio perfil',
        description:
            'Atualiza os dados do usuário autenticado. Informe ao menos um campo. Campos opcionais como middleName e email podem ser removidos enviando null ou string vazia.',
    })
    @ApiBody({ schema: updateProfileBodySchema })
    @ApiOkResponse({ description: 'Perfil atualizado', schema: userProfileSchema })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiConflictResponse({
        description: 'Username ou email já cadastrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    updateMe(
        @Req() req: AuthenticatedRequest,
        @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
    ) {
        return this.users.update(req.user.id, body);
    }

    @Patch('me/password')
    @ApiOperation({
        summary: 'Alterar a própria senha',
        description:
            'Altera a senha do usuário autenticado. É necessário informar a senha atual e a nova senha.',
    })
    @ApiBody({ schema: changePasswordBodySchema })
    @ApiOkResponse({
        description: 'Senha alterada',
        schema: messageResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Senha atual incorreta ou nova senha inválida',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    changeMyPassword(
        @Req() req: AuthenticatedRequest,
        @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
    ) {
        return this.users.changePassword(
            req.user.id,
            body.currentPassword,
            body.newPassword,
        );
    }

    @Patch(':id')
    @RequirePermissions('users.edit')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Editar outro usuário',
        description:
            'Atualiza os dados de outro usuário. Requer a permissão users.edit. Informe ao menos um campo.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @ApiBody({ schema: updateUserBodySchema })
    @ApiOkResponse({ description: 'Usuário atualizado', schema: userProfileSchema })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiConflictResponse({
        description: 'Username ou email já cadastrado',
        schema: errorSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.edit',
        schema: errorSchema,
    })
    @ApiNotFoundResponse({
        description: 'Usuário não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserDto,
    ) {
        return this.users.update(id, body);
    }

    @Patch(':id/password')
    @RequirePermissions('users.editPassword')
    @UseGuards(PermissionsGuard)
    @ApiOperation({
        summary: 'Redefinir a senha de outro usuário',
        description:
            'Define uma nova senha para outro usuário, sem exigir a senha atual. Requer a permissão users.editPassword.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @ApiBody({ schema: resetPasswordBodySchema })
    @ApiOkResponse({
        description: 'Senha alterada',
        schema: messageResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.editPassword',
        schema: errorSchema,
    })
    @ApiNotFoundResponse({
        description: 'Usuário não encontrado',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    resetPassword(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordDto,
    ) {
        return this.users.resetPassword(id, body.newPassword);
    }

    @Get(':id/equipamentos')
    @ApiOperation({
        summary: 'Listar equipamentos de um usuário',
        description:
            'Lista os equipamentos vinculados ao usuário, na ordem definida, com a indicação de que ele sabe operá-los. Requer a permissão users.view.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID do usuário',
        example: 'V1StGXR8_Z5j',
    })
    @RequirePermissions('users.view')
    @UseGuards(PermissionsGuard)
    @ApiOkResponse({
        description: 'Equipamentos vinculados ao usuário',
        schema: userEquipamentoListSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão users.view',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    operators(@Param('id') id: string) {
        return this.equipamento.findEquipamentos(id)
    }
}
