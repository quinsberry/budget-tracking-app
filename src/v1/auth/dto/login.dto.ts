import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const LoginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export class LoginDto extends createZodDto(LoginSchema) {
    @ApiProperty({
        default: 'test@test.com',
    })
    email: string;

    @ApiProperty({
        default: 'password',
    })
    password: string;
}
