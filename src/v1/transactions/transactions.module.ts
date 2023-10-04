import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CardsService } from '../cards/cards.service';
import { MonobankService } from '../../shared/services/monobank.service';
import { UsersService } from '../users/users.service';

@Module({
    controllers: [TransactionsController],
    providers: [TransactionsService, MonobankService, CardsService, UsersService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
