import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

type JwtPayload = {
    sub?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
            algorithms: ['HS256'],
        });
    }

    /**
     * O token carrega apenas o `sub`. Os dados de autorização são lidos do
     * banco a cada requisição para que remoção/despromoção de usuário tenha
     * efeito imediato, sem esperar o token expirar.
     */
    async validate(payload: JwtPayload) {
        if (!payload.sub) {
            throw new UnauthorizedException('Sessão inválida');
        }

        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Sessão inválida');
        }

        return {
            id: user.id,
            userId: user.id,
            username: user.username,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin,
            circuitoId: user.circuitoId,
        };
    }
}
