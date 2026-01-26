import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        });
    }

    /**
     * Passport 會自動呼叫此方法驗證 JWT
     * 回傳值會被附加到 request.user
     */
    async validate(payload: JwtPayload) {
        return this.authService.validateUser(payload);
    }
}
