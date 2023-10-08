import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { MonobankService } from '@/shared/services/monobank.service';
import { Decimal } from '@prisma/client/runtime/library';
import { AvailableBank } from '@prisma/client';
import { fromSecondsToDate } from '@/shared/utils/date';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CardsService } from '@/v1/cards/cards.service';

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private monobankService: MonobankService,
        @Inject(forwardRef(() => CardsService))
        private cardsService: CardsService
    ) {}

    createOne(dto: CreateTransactionDto) {
        return this.prisma.transaction.upsert({
            where: {
                originalId: dto.originalId,
            },
            update: {},
            create: {
                cardId: dto.cardId,
                originalId: dto.originalId,
                description: dto.description,
                originalDescription: dto.originalDescription,
                amount: new Decimal(dto.amount / 100),
                currencyCode: dto.currencyCode,
                createdAt: dto.createdAt,
                tags: {
                    create: [],
                },
            },
        });
    }

    createMany(invoices: CreateTransactionDto[]) {
        return Promise.all(invoices.map(invoice => this.createOne(invoice)));
    }

    async seedTransactions(cardId: string, from: Date): Promise<void> {
        const card = await this.cardsService.findOne(cardId);
        if (card.bank === AvailableBank.Monobank) {
            return this.monobankService.fetchInvoices({
                token: card.monobankDetails.token,
                accountId: card.originalId,
                from,
                onPartUploaded: invoices => {
                    this.createMany(
                        invoices.map(invoice => ({
                            cardId,
                            originalId: invoice.id,
                            originalDescription: invoice.description,
                            amount: invoice.amount,
                            currencyCode: invoice.currencyCode,
                            createdAt: fromSecondsToDate(invoice.time),
                        }))
                    );
                },
            });
        } else {
            throw new NotFoundException('Functionality for your bank was not implemented yet');
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'dailyTransactionsSeeding' })
    async dailyTransactionsSeeding(): Promise<void> {
        const cards = await this.cardsService.findAll();
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        for (const card of cards) {
            this.seedTransactions(card.id, monthAgo);
        }
    }

    findLastByCardId(cardId: string) {
        return this.prisma.transaction.findFirst({
            where: {
                cardId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    findAllByCardId(cardId: string, take: number = 100, skip: number = 0) {
        return this.prisma.transaction.findMany({
            where: {
                cardId,
            },
            take,
            skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                tags: true,
            },
        });
    }

    findOneById(transactionId: string) {
        return this.prisma.transaction.findUnique({
            where: {
                id: transactionId,
            },
            include: {
                tags: true,
                card: true,
            },
        });
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto) {
        return this.prisma.transaction.update({
            where: {
                id: transactionId,
            },
            data: {
                description: updateTransactionDto.description,
                // TODO: add tags update
            },
        });
    }
}
