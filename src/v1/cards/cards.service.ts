import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonobankCardDto } from './dto/create-monobank-card.dto';
import { UpdateMonobankCardDto } from './dto/update-monobank-card.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AvailableBank } from '@prisma/client';
import { MonobankService } from '../../shared/services/monobank.service';
import { UsersService } from '../users/users.service';
import { exclude } from '../../shared/prisma/utils/exclude';
import { fromSecondsToDate } from '../../shared/utils/date';

@Injectable()
export class CardsService {
    constructor(
        private prisma: PrismaService,
        private monobankService: MonobankService,
        private usersService: UsersService
    ) {}

    async createMonobankCard(userId: string, dto: CreateMonobankCardDto) {
        const clientInfo = await this.monobankService.fetchClientInfo({ token: dto.token });
        if ('errorDescription' in clientInfo) throw new BadRequestException('Token is not valid');
        const foundTheCard = clientInfo.accounts.find(account =>
            account.maskedPan.find(cardNumber => this.monobankService.areCardNumbersMatches(cardNumber, dto.cardNumber))
        );
        if (!foundTheCard) throw new BadRequestException('Card number is not valid');
        const card = await this.prisma.card.findUnique({
            where: {
                cardNumber: dto.cardNumber,
                id: userId,
            },
        });
        if (card !== null) throw new BadRequestException('Card is already exists');

        return this.prisma.card.create({
            data: {
                userId,
                originalId: foundTheCard.id,
                description: dto.description,
                bank: AvailableBank.Monobank,
                cardNumber: dto.cardNumber,
                startTrackingTime: fromSecondsToDate(dto.startTrackingTime),
                monobankDetails: {
                    create: {
                        token: dto.token,
                    },
                },
            },
        });
    }

    findAllByUserId(userId: string) {
        return this.prisma.card.findMany({
            where: {
                userId,
            },
        });
    }

    async findOne(cardId: string) {
        const card = await this.prisma.card.findUnique({
            where: {
                id: cardId,
            },
            include: {
                monobankDetails: true,
                user: true,
            },
        });
        return {
            ...card,
            user: exclude(card.user, ['password']),
        };
    }

    async update(userId: string, cardId: string, dto: UpdateMonobankCardDto) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User is not found');
        const card = user.cards.find(card => card.id === cardId);
        if (!card) throw new NotFoundException('Card is not found');

        if (dto.token) {
            const clientInfo = await this.monobankService.fetchClientInfo({ token: dto.token });
            if ('errorDescription' in clientInfo) throw new BadRequestException('Token is not valid');
        }

        return this.prisma.card.update({
            where: {
                id: cardId,
                userId,
            },
            data: {
                description: dto.description,
                cardNumber: dto.cardNumber,
                // TODO: if startTrackingTime changed - need to fetch older transactions from monobank or remove them
                startTrackingTime: fromSecondsToDate(dto.startTrackingTime),
                monobankDetails: {
                    update: {
                        ...(dto.token ? { token: dto.token } : {}),
                    },
                },
            },
        });
    }

    async remove(userId: string, cardId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User is not found');
        const card = user.cards.find(card => card.id === cardId);
        if (!card) throw new NotFoundException('Card is not found');

        return this.prisma.card.delete({
            where: {
                id: cardId,
                userId,
            },
        });
    }
}
