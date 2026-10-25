import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import type { LoginDto, RegisterDto } from './auth.schemas';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && (await argon2.verify(user.password, pass))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async register({ username, email, password }: RegisterDto) {
        const existing = await this.usersService.findByEmailOrUsername(email, username);
        if (existing) throw new ConflictException('Email ou username já cadastrado');

        const hash = await argon2.hash(password);
        const user = await this.usersService.create({ username, email, password: hash });

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
            username: user.username,
        });
        return { user, accessToken };
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, username: user.username };
        return {
            accessToken: await this.jwt.signAsync(payload),
        };
    }

    async loginWithBody({ email, password }: LoginDto) {
        const user = await this.validateUser(email, password);
        if (!user) throw new UnauthorizedException('Credenciais inválidas');
        return this.login(user);
    }
}
