import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { AvailableBank } from '@prisma/client';

import { PrismaService } from '@/shared/prisma/prisma.service';
import { exclude } from '@/shared/prisma/utils/exclude';
import { MonobankService } from '@/shared/services/monobank.service';
import { TransactionsService } from '@/v1/transactions/transactions.service';

import { CreateMonobankCardDto } from './dto/create-monobank-card.dto';
import { UpdateMonobankCardDto } from './dto/update-monobank-card.dto';

@Injectable()
export class CardsService {
    constructor(
        private prisma: PrismaService,
        private monobankService: MonobankService,
        @Inject(forwardRef(() => TransactionsService))
        private transactionService: TransactionsService
    ) {}

    async createMonobankCard(userId: string, dto: CreateMonobankCardDto) {
        const clientInfo = await this.monobankService.fetchClientInfo({ token: dto.token });
        if ('errorDescription' in clientInfo) throw new BadRequestException('Token is not valid');
        const foundTheCard = clientInfo.accounts.find(account =>
            account.maskedPan.find(cardNumber => this.monobankService.areCardNumbersMatches(cardNumber, dto.cardNumber))
        );
        if (!foundTheCard) throw new BadRequestException('Card number is not valid');
        const existingCard = await this.prisma.card.findUnique({
            where: {
                cardNumber: dto.cardNumber,
                id: userId,
            },
        });
        if (existingCard !== null) throw new BadRequestException('Card is already exists');

        const card = await this.prisma.card.create({
            data: {
                userId,
                originalId: foundTheCard.id,
                description: dto.description,
                bank: AvailableBank.Monobank,
                cardNumber: dto.cardNumber,
                startTrackingTime: dto.startTrackingTime,
                monobankDetails: {
                    create: {
                        token: dto.token,
                    },
                },
            },
        });
        this.transactionService.seedTransactions(card.id, card.startTrackingTime);
        return card;
    }

    findAll() {
        return this.prisma.card.findMany({
            include: {
                monobankDetails: true,
                user: true,
                pkoDetails: true,
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

    async findOne(cardId: string, userId?: string) {
        const card = await this.prisma.card.findUnique({
            where: {
                id: cardId,
                ...(userId ? { userId } : {}),
            },
            include: {
                monobankDetails: true,
                user: true,
                pkoDetails: true,
            },
        });
        return {
            ...card,
            user: exclude(card.user, ['password']),
        };
    }

    async update(userId: string, cardId: string, dto: UpdateMonobankCardDto) {
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
                startTrackingTime: dto.startTrackingTime,
                monobankDetails: {
                    update: {
                        ...(dto.token ? { token: dto.token } : {}),
                    },
                },
            },
        });
    }

    async remove(userId: string, cardId: string) {
        return this.prisma.card.delete({
            where: {
                id: cardId,
                userId,
            },
        });
    }
}
