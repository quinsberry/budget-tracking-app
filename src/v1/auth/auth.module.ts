import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppConfiguration } from '@/shared/config/configuration';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersService } from '../users/users.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const { jwt } = configService.get<AppConfiguration>('app');
                return {
                    secret: jwt.secret,
                    signOptions: { expiresIn: jwt.expiresIn },
                };
            },
        }),
        PassportModule,
    ],
    providers: [AuthService, UsersService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
