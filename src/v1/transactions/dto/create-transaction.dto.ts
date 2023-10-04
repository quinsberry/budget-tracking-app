import { ApiProperty } from '@nestjs/swagger';
import { TransactionTagsOfTransaction } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateTransactionSchema = z.object({
    originalId: z.string().optional(),
    description: z.string().optional(),
    originalDescription: z.string().optional(),
    tags: z.array(z.string()).optional(),
    amount: z.number(),
    currencyCode: z.number(),
    cardId: z.string(),
    createdAt: z.date(),
});

export class CreateTransactionDto extends createZodDto(CreateTransactionSchema) {
    @ApiProperty({
        default: 'original_transaction_id_from_the_bank',
    })
    originalId?: string;

    @ApiProperty({
        default: 'custom user description',
    })
    description?: string;

    @ApiProperty({
        default: 'original bank description',
    })
    originalDescription?: string;

    @ApiProperty({
        default: [],
    })
    tags?: string[];

    @ApiProperty({
        default: 12.00,
    })
    amount: number;

    @ApiProperty({
        default: 980,
    })
    currencyCode: number;

    @ApiProperty({
        default: 'card_id',
    })
    cardId: string;

    @ApiProperty({
        default: '1910230291',
    })
    createdAt: Date;
}
