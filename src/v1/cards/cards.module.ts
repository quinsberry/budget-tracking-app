import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { UsersService } from '@/v1/users/users.service';
import { TransactionsService } from '@/v1/transactions/transactions.service';

@Module({
    controllers: [CardsController],
    providers: [CardsService, UsersService, TransactionsService],
    exports: [CardsService],
})
export class CardsModule {}
