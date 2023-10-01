import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const LoginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export class LoginDto extends createZodDto(LoginSchema) {
    @ApiProperty({
        default: 'email@example.com',
    })
    email: string;

    @ApiProperty({
        default: '123qweRTY!=',
    })
    password: string;
}