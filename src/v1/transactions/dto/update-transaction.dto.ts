import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UpdateTransactionSchema = z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export class UpdateTransactionDto extends createZodDto(UpdateTransactionSchema) {
    @ApiProperty({
        default: 'custom user description',
    })
    description?: string;

    @ApiProperty({
        default: [],
    })
    tags?: string[];
}
