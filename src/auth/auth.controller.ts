import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { loginSchema, registerSchema } from './auth.schemas';
import type { LoginDto, RegisterDto } from './auth.schemas';
import {
    errorSchema,
    loginBodySchema,
    loginResponseSchema,
    registerBodySchema,
    registerResponseSchema,
    userProfileSchema,
} from '../swagger/schemas';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('register')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Cadastrar usuário',
        description: 'Se não houver usuários cadastrados, o primeiro usuário será criado como administrador. Caso contrário, é necessário estar autenticado como administrador ou ter a permissão users.create.',
    })
    @ApiBody({ schema: registerBodySchema })
    @ApiCreatedResponse({
        description: 'Usuário cadastrado',
        schema: registerResponseSchema,
    })
    @ApiBadRequestResponse({ schema: errorSchema })
    @ApiConflictResponse({
        description: 'Username ou email já cadastrado',
        schema: errorSchema,
    })
    @ApiForbiddenResponse({
        description: 'Sem permissão para cadastrar usuários',
        schema: errorSchema,
    })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    @UsePipes(new ZodValidationPipe(registerSchema))
    async register(@Body() body: RegisterDto, @Req() req: any) {
        return this.auth.register(body, req.user ?? null);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Fazer login com username e senha' })
    @ApiBody({ schema: loginBodySchema })
    @ApiOkResponse({
        description: 'Login realizado',
        schema: loginResponseSchema,
    })
    @ApiUnauthorizedResponse({
        description: 'Credenciais inválidas',
        schema: errorSchema,
    })
    async login(@Req() req: any) {
        return this.auth.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retornar o perfil do usuário autenticado' })
    @ApiOkResponse({ schema: userProfileSchema })
    @ApiUnauthorizedResponse({ schema: errorSchema })
    me(@Req() req: any) {
        return this.auth.getProfile(req.user.id);
    }
}
