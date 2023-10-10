import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/shared/prisma/prisma.service';

import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) {}

    createOne(dto: CreateTagDto) {
        return this.prisma.transactionTag.upsert({
            where: { name: dto.name },
            create: {
                name: dto.name,
            },
            update: {
                name: dto.name,
            },
        });
    }

    createMany(dtos: CreateTagDto[]) {
        return Promise.all(dtos.map(invoice => this.createOne(invoice)));
    }

    async addTagsToTransaction(tags: CreateTagDto[], transactionId: string) {
        const createdOrFoundTags = await this.createMany(tags);
        return this.prisma.transactionTagsOfTransaction.createMany({
            data: createdOrFoundTags.map(dto => ({
                transactionId: transactionId,
                tagId: dto.id,
            })),
            skipDuplicates: true,
        });
    }

    async updateTagsOfTransaction(tags: CreateTagDto[], transactionId: string) {
        const createdOrFoundTags = await this.createMany(tags);
        return this.prisma.transactionTagsOfTransaction.updateMany({
            where: {
                transactionId: transactionId,
            },
            data: createdOrFoundTags.map(dto => ({
                transactionId: transactionId,
                tagId: dto.id,
            })),
        });
    }

    findAll() {
        return this.prisma.transactionTag.findMany();
    }

    findAllCardTags(cardId: string) {
        return this.prisma.transactionTagsOfTransaction.findMany({
            where: {
                transaction: {
                    cardId: cardId,
                },
            },
        });
    }

    findOne(tagId: number) {
        return this.prisma.transactionTag.findUnique({
            where: {
                id: tagId,
            },
        });
    }

    findOneWithRelatedCardTransaction(cardId: string, tagId: number) {
        return this.prisma.transactionTag.findUnique({
            where: {
                id: tagId,
            },
            include: {
                transactions: {
                    where: {
                        transaction: {
                            cardId: cardId,
                        },
                    },
                },
            },
        });
    }

    remove(id: number) {
        return this.prisma.transactionTag.delete({
            where: {
                id: id,
            },
        });
    }
}
