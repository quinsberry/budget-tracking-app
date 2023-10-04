import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
    imports: [UsersModule, AuthModule, CardsModule, TransactionsModule],
})
export class V1Module {}
