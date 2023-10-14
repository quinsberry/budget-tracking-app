import { Inject, Injectable, NotImplementedException, forwardRef } from '@nestjs/common';
import { AvailableBank, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { parseDesctiptionIntoTags } from '@/lib/monobank/parser';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { MonobankService } from '@/shared/services/monobank.service';
import { fromSecondsToDate } from '@/shared/utils/date';
import { CardsService } from '@/v1/cards/cards.service';
import { TagsService } from '@/v1/tags/tags.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private monobankService: MonobankService,
        private tagsService: TagsService,
        @Inject(forwardRef(() => CardsService))
        private cardsService: CardsService
    ) {}

    async createOne(dto: CreateTransactionDto) {
        const transaction = await this.prisma.transaction.upsert({
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
            },
        });
        this.tagsService.addTagsToTransaction(
            dto.tags.map(name => ({ name })),
            transaction.id
        );
        return transaction;
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
                            tags: [parseDesctiptionIntoTags(invoice.description)],
                        }))
                    );
                },
            });
        } else {
            throw new NotImplementedException('Functionality for your bank was not implemented yet');
        }
    }

    async seedTransactionsByUserId(userId: string, cardId: string, from: Date): Promise<void> {
        const card = await this.cardsService.findOne(cardId, userId);
        if (card) {
            return this.seedTransactions(cardId, from);
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

    async findAllOfUser({
        userId,
        take,
        skip,
        cardId,
        from,
        to,
    }: {
        userId: string;
        take: number;
        skip: number;
        cardId?: string;
        from?: Date;
        to?: Date;
    }) {
        const where: Prisma.TransactionFindManyArgs['where'] = {
            card: {
                userId,
                ...(cardId ? { id: cardId } : {}),
            },
            createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
            },
        };
        this.prisma.transaction.count({ where });
        const result = await this.withCount(
            this.prisma.transaction.findMany({
                where,
                take,
                skip,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    tags: {
                        include: {
                            tag: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    card: !cardId
                        ? {
                              select: {
                                  id: true,
                                  description: true,
                                  bank: true,
                                  cardNumber: true,
                                  startTrackingTime: true,
                                  createdAt: true,
                              },
                          }
                        : false,
                },
            }),
            where
        );
        return {
            ...result,
            data: result.data.map(transaction => ({
                ...transaction,
                tags: transaction.tags.map(({ tag }) => tag.name),
            })),
        };
    }

    findAllOfUserByTagNames({
        tagNames,
        take,
        skip,
        userId,
        cardId,
        from,
        to,
    }: {
        tagNames: string[];
        take: number;
        skip: number;
        userId: string;
        cardId?: string;
        from?: Date;
        to?: Date;
    }) {
        const where: Prisma.TransactionWhereInput = {
            tags: {
                some: {
                    OR: tagNames.map(name => ({
                        tag: {
                            name,
                        },
                    })),
                },
            },
            card: {
                userId,
                ...(cardId ? { id: cardId } : {}),
            },
            createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
            },
        };
        return this.withCount(
            this.prisma.transaction.findMany({
                where,
                take,
                skip,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            }),
            where
        );
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

    private async withCount<T extends any[], P extends Prisma.PrismaPromise<T>>(
        fn: P,
        where: Prisma.TransactionWhereInput
    ) {
        const [data, totalCount] = await this.prisma.$transaction<
            [Prisma.PrismaPromise<T>, Prisma.PrismaPromise<number>]
        >([fn, this.prisma.transaction.count({ where })]);
        return {
            metadata: {
                totalCount,
                count: data.length,
            },
            data,
        };
    }
}
