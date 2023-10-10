import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { TagsModule } from './tags/tags.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [UsersModule, AuthModule, CardsModule, TransactionsModule, TagsModule],
})
export class V1Module {}
