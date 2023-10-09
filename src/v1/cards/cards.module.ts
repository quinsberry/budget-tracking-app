import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { UsersService } from '@/v1/users/users.service';
import { TransactionsService } from '@/v1/transactions/transactions.service';
import { TagsService } from '@/v1/tags/tags.service';

@Module({
    controllers: [CardsController],
    providers: [CardsService, UsersService, TransactionsService, TagsService],
    exports: [CardsService],
})
export class CardsModule {}
