import { Body, Controller, Get, HttpCode, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { loginSchema, registerSchema } from './auth.schemas';
import type { LoginDto, RegisterDto } from './auth.schemas';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('register')
    @UsePipes(new ZodValidationPipe(registerSchema))
    async register(@Body() body: RegisterDto) {
        return this.auth.register(body);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    async login(@Req() req: any) {
        return this.auth.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
        return req.user;
    }
}
