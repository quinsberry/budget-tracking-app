import { Module } from '@nestjs/common';

import { CardsService } from '@/v1/cards/cards.service';
import { TagsService } from '@/v1/tags/tags.service';
import { UsersService } from '@/v1/users/users.service';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
    controllers: [TransactionsController],
    providers: [TransactionsService, CardsService, UsersService, TagsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
