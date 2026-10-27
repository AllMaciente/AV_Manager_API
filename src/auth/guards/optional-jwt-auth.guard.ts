import { AuthGuard } from '@nestjs/passport';

export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        if (err) {
            throw err;
        }
        return user ?? null;
    }
}
