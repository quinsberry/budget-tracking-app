import { PartialType } from '@nestjs/swagger';

import { CreateMonobankCardDto } from './create-monobank-card.dto';

export class UpdateMonobankCardDto extends PartialType(CreateMonobankCardDto) {}
