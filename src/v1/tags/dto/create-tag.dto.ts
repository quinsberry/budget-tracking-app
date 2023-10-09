import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateTagDtoSchema = z.object({
    name: z.string(),
});

export class CreateTagDto extends createZodDto(CreateTagDtoSchema) {
    @ApiProperty({
        default: 'food',
    })
    name: string;
}
