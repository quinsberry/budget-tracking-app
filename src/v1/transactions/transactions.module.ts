import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CardsService } from '../cards/cards.service';
import { UsersService } from '../users/users.service';

@Module({
    controllers: [TransactionsController],
    providers: [TransactionsService, CardsService, UsersService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
