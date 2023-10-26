import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfiguration } from '@/shared/config/configuration';
import { UsersService } from '@/v1/users/users.service';

import { JwtPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<AppConfiguration>('app').jwt.secret,
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
