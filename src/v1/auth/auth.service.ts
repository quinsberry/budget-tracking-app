import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Provider, Token, User } from '@prisma/client';
import { add } from 'date-fns';
import { v4 } from 'uuid';

import { AppConfiguration } from '@/shared/config/configuration';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PasswordService } from '@/shared/services/password.service';
import { CreateUserDto } from '@/v1/users/dto/create-user.dto';
import { UsersService } from '@/v1/users/users.service';

import { Tokens } from './types';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService
    ) {}

    async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
        const token = await this.prismaService.token.delete({ where: { token: refreshToken } });
        if (!token) {
            throw new UnauthorizedException('The refresh token is invalid');
        }
        if (new Date(token.expires) < new Date()) {
            throw new UnauthorizedException('The refresh token is expired');
        }
        const user = await this.usersService.findById(token.userId);
        return this.generateTokens(user, agent);
    }

    async register(dto: CreateUserDto) {
        const existedUser = await this.usersService.findByEmail(dto.email).catch(err => {
            this.logger.error(err);
            return null;
        });
        if (existedUser) {
            throw new ConflictException('The user with this email already exists');
        }
        const hashedPassword = await this.passwordService.hashPassword(dto.password);
        const user = await this.usersService.create({
            ...dto,
            password: hashedPassword,
        });
        await this.usersService.addAccountToUser(user.id, Provider.Credentials, user.id);
        return user;
    }

    async login(email: string, password: string, agent: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Login or password is incorrect');
        }
        const passwordValid = await this.passwordService.comparePassword(user.password, password);
        if (!passwordValid) {
            throw new UnauthorizedException('Login or password is incorrect');
        }
        return this.generateTokens(user, agent);
    }

    private async generateTokens(user: User, agent: string): Promise<Tokens> {
        const accessToken = this.jwtService.sign({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
        });
        const refreshToken = await this.getRefreshToken(user.id, agent);
        return { accessToken, refreshToken };
    }

    private async getRefreshToken(userId: string, agent: string): Promise<Token> {
        const _token = await this.prismaService.token.findFirst({
            where: {
                userId,
                userAgent: agent,
            },
        });
        const token = _token?.token ?? '';
        const refreshExpiresIn = this.configService.get<AppConfiguration>('app').jwt.refreshExpiresIn;
        return this.prismaService.token.upsert({
            where: { token },
            update: {
                token: v4(),
                expires: add(new Date(), { days: Number(refreshExpiresIn) }),
            },
            create: {
                token: v4(),
                expires: add(new Date(), { days: Number(refreshExpiresIn) }),
                userId,
                userAgent: agent,
            },
        });
    }

    deleteRefreshToken(token: string) {
        return this.prismaService.token.delete({ where: { token } });
    }

    async providerAuth(props: {
        fullName: string;
        email: string;
        originalProviderId: string;
        provider: Provider;
    }): Promise<User> {
        const { fullName, email, provider, originalProviderId } = props;
        let user = await this.usersService.findByEmail(email);
        if (!user) {
            user = await this.usersService.create({
                email,
                fullName,
            });
        }
        await this.usersService.addAccountToUser(user.id, provider, originalProviderId);
        return user;
    }

    async providerTokens(email: string, agent: string): Promise<Tokens> {
        const user = await this.usersService.findByEmail(email);
        return this.generateTokens(user, agent);
    }
}
