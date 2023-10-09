import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CardsService } from '@/v1/cards/cards.service';
import { UsersService } from '@/v1/users/users.service';
import { TagsService } from '@/v1/tags/tags.service';

@Module({
    controllers: [TransactionsController],
    providers: [TransactionsService, CardsService, UsersService, TagsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
