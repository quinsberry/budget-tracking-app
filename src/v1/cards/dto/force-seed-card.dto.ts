import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const ForceSeedCardSchema = z.object({
    cardId: z.string().uuid(),
    from: z.string().datetime(),
});

export class ForceSeedCardDto extends createZodDto(ForceSeedCardSchema) {
    @ApiProperty({
        default: '2e909362-1bad-45b6-ae4d-5ed24e100112',
        description: 'UUID format',
    })
    cardId: string;

    @ApiProperty({
        default: '2023-08-06T17:42:55.527Z',
        description: 'ISO format',
    })
    from: string;
}
