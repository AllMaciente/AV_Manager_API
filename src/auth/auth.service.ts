import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import type { LoginDto, RegisterDto } from './auth.schemas';

type TokenUser = {
    id: string;
    username: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string | null;
    isAdmin: boolean;
    circuitoId: string | null;
};

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
        private permissionsService: PermissionsService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (user && (await argon2.verify(user.password, pass))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async register(
        { username, firstName, middleName, lastName, email, password }: RegisterDto,
        requester?: TokenUser | null,
    ) {
        const existing = await this.usersService.findByUsernameOrEmail(username, email);
        if (existing) throw new ConflictException('Username ou email já cadastrado');

        const count = await this.usersService.count();

        if (count === 0) {
            const hash = await argon2.hash(password);
            const user = await this.usersService.create({
                username,
                firstName,
                middleName,
                lastName,
                email,
                password: hash,
                isAdmin: true,
            });

            return { user, accessToken: await this.signToken(user) };
        }

        if (!requester) {
            throw new ForbiddenException('Apenas administradores ou usuários com permissão users.create podem cadastrar novos usuários');
        }

        if (requester.isAdmin) {
            const hash = await argon2.hash(password);
            const user = await this.usersService.create({
                username,
                firstName,
                middleName,
                lastName,
                email,
                password: hash,
                isAdmin: false,
            });

            return { user, accessToken: await this.signToken(user) };
        }

        const owned = await this.permissionsService.getUserPermissions(requester.id);
        if (!owned.has('users.create')) {
            throw new ForbiddenException('Apenas administradores ou usuários com permissão users.create podem cadastrar novos usuários');
        }

        const hash = await argon2.hash(password);
        const user = await this.usersService.create({
            username,
            firstName,
            middleName,
            lastName,
            email,
            password: hash,
            isAdmin: false,
        });

        return { user, accessToken: await this.signToken(user) };
    }

    async login(user: any) {
        return {
            accessToken: await this.signToken(user),
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('Usuário não encontrado');

        const { password, ...profile } = user;
        return profile;
    }

    async loginWithBody({ username, password }: LoginDto) {
        const user = await this.validateUser(username, password);
        if (!user) throw new UnauthorizedException('Credenciais inválidas');
        return this.login(user);
    }

    private signToken(user: TokenUser) {
        return this.jwt.signAsync({
            sub: user.id,
            username: user.username,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            circuitoId: user.circuitoId,
        });
    }
}
