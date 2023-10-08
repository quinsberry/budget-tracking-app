import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    getAll() {
        return this.prisma.user.findMany();
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    findById(id: string) {
        return this.prisma.user.findUnique({
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
        return this.prisma.user.create({
            data: {
                ...dto,
                settings: {
                    create: {},
                }
            },
        });
    }
}
