import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';

@Module({
    imports: [UsersModule, AuthModule, CardsModule],
})
export class V1Module {}
