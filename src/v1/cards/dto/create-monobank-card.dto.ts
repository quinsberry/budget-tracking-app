import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateMonobankCardSchema = z.object({
    description: z.string().optional(),
    cardNumber: z.string().length(16),
    token: z.string(),
    startTrackingTime: z.number(),
});

export class CreateMonobankCardDto extends createZodDto(CreateMonobankCardSchema) {
    @ApiProperty({
        default: 'email@example.com',
    })
    description?: string;

    @ApiProperty({
        default: '1234123412341234',
    })
    cardNumber: string;

    @ApiProperty({
        default: 1696444881,
        description: 'Time in seconds',
    })
    startTrackingTime: number;

    @ApiProperty({
        default: '12dahwd7awb2hjxbnaA!a8sdajn2',
    })
    token: string;
}