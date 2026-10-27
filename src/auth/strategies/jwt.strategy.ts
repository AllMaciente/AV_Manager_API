import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            userId: payload.sub,
            username: payload.username,
            firstName: payload.firstName,
            middleName: payload.middleName,
            lastName: payload.lastName,
            email: payload.email,
            isAdmin: payload.isAdmin,
            circuitoId: payload.circuitoId,
        };
    }
}
