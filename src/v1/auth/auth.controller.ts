import {
    Body,
    ConflictException,
    Controller,
    Get,
    HttpStatus,
    Post,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Swagger, { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Token } from '@prisma/client';
import type { Request, Response } from 'express';

import { AppConfiguration } from '@/shared/config/configuration';
import { Cookie } from '@/shared/decorators/cookie.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { exclude } from '@/shared/prisma/utils/exclude';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

const REFRESH_TOKEN = 'refresh_token';
@Controller()
@ApiTags('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) {}

    @Get('/me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getMe(@UserId() id: string) {
        const user = await this.usersService.findById(id);
        return exclude(user, ['password']);
    }

    @Post('login')
    @ApiBody({ type: LoginDto })
    async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
        const tokens = await this.authService.login(dto.email, dto.password, agent);
        this.setRefreshTokenToCookies(tokens.refreshToken, res);
        res.status(HttpStatus.OK).json({ accessToken: tokens.accessToken });
    }

    @Post('register')
    @ApiBody({ type: RegisterDto })
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        delete user.password;
        delete user.tokens;
        delete user.accounts;
        return user;
    }

    @Get('logout')
    async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
        if (!refreshToken) {
            res.sendStatus(HttpStatus.OK);
            return;
        }
        await this.authService.deleteRefreshToken(refreshToken);
        const deleteToken: Token = {
            token: '',
            expires: new Date(),
            userId: '',
            userAgent: '',
        };
        this.setRefreshTokenToCookies(deleteToken, res);
        res.sendStatus(HttpStatus.OK);
    }

    @Get('refresh-tokens')
    // @Swagger.Coo(REFRESH_TOKEN)
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
        if (!refreshToken) {
            throw new ConflictException(`Cookie ${REFRESH_TOKEN} is not provided`);
        }
        const tokens = await this.authService.refreshTokens(refreshToken, agent);
        if (!tokens) {
            throw new UnauthorizedException('The refresh token is invalid');
        }
        this.setRefreshTokenToCookies(tokens.refreshToken, res);
        res.status(HttpStatus.OK).json({ accessToken: tokens.accessToken });
    }

    private setRefreshTokenToCookies(refreshToken: Token, res: Response) {
        const config = this.configService.get<AppConfiguration>('app');
        res.cookie(REFRESH_TOKEN, refreshToken.token, {
            httpOnly: config.NODE_ENV !== 'production',
            sameSite: 'lax',
            expires: new Date(refreshToken.expires),
            secure: config.NODE_ENV === 'production',
            path: '/',
        });
    }
}
