import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '@/v1/users/users.service';

import { JwtPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET,
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.id).catch(err => {
            this.logger.error(err);
            return null;
        });
        if (!user) {
            throw new UnauthorizedException('Access denied');
        }
        return payload;
    }
}
