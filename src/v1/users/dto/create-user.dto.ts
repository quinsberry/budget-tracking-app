import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateUserSchema = z.object({
    email: z.string(),
    fullName: z.string(),
    password: z.string(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
    @ApiProperty({
        default: 'email@example.com',
    })
    email: string;

    @ApiProperty({
        default: 'Elon Musk',
    })
    fullName: string;

    @ApiProperty({
        default: '123qweRTY!=',
    })
    password: string;
}
