import { Module } from '@nestjs/common';

import { TagsService } from '@/v1/tags/tags.service';
import { TransactionsService } from '@/v1/transactions/transactions.service';
import { UsersService } from '@/v1/users/users.service';

import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
    controllers: [CardsController],
    providers: [CardsService, UsersService, TransactionsService, TagsService],
    exports: [CardsService],
})
export class CardsModule {}
