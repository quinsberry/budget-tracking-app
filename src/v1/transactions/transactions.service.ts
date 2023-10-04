import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MonobankService } from '../../shared/services/monobank.service';
import { CardsService } from '../cards/cards.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private monobankService: MonobankService,
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

    async seedMonobankTransactions(cardId: string, from: number, to?: number) {
        const card = await this.cardsService.findOne(cardId);
        if (!card) throw new NotFoundException('Card is not found');
        const invoices = await this.monobankService.fetchInvoices({
            token: card.monobankDetails.token,
            accountId: card.originalId,
            from,
            to,
        });
        if ('errorDescription' in invoices) {
            if (MonobankService.isTokenError(invoices.errorDescription)) {
                this.prisma.monobankDetails.update({
                    where: {
                        id: card.monobankDetails.id,
                        cardId: card.id,
                    },
                    data: {
                        isTokenValid: false,
                    },
                });
            }
            throw new BadRequestException(invoices.errorDescription);
        }
        return this.createMany(
            invoices.map(invoice => ({
                cardId,
                originalId: invoice.id,
                originalDescription: invoice.description,
                amount: invoice.amount,
                currencyCode: invoice.currencyCode,
                createdAt: new Date(invoice.time * 1000),
            }))
        );
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
