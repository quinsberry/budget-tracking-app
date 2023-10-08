import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CardsService } from '@/v1/cards/cards.service';
import { UsersService } from '@/v1/users/users.service';

@Module({
    controllers: [TransactionsController],
    providers: [TransactionsService, CardsService, UsersService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
