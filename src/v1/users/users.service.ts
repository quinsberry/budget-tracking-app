import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';
import { PasswordService } from '@/shared/services/password.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService, private readonly passwordService: PasswordService) {}

    getAll() {
        return this.prismaService.user.findMany();
    }

    findByEmail(email: string) {
        return this.prismaService.user.findUnique({
            where: {
                email,
            },
        });
    }

    findById(id: string) {
        return this.prismaService.user.findUnique({
            where: {
                id,
            },
            include: {
                settings: true,
                cards: true,
            },
        });
    }

    async create(dto: CreateUserDto) {
        const user = await this.prismaService.user.create({
            data: {
                ...dto,
                tokens: {
                    create: [],
                },
                accounts: {
                    create: [],
                },
                settings: {
                    create: {},
                },
            },
            include: {
                settings: true,
                cards: true,
                accounts: true,
                tokens: true,
            },
        });
        return user;
    }

    addAccountToUser(userId: string, provider: Provider, providerAccountId: string) {
        return this.prismaService.account.upsert({
            where: { userId, provider, providerAccountId },
            update: {},
            create: {
                provider,
                providerAccountId,
                userId,
            },
        });
    }
}
