import { Routes } from '@nestjs/core';
import { V1Module } from '@/v1/v1.module';
import { UsersModule } from '@/v1/users/users.module';
import { AuthModule } from '@/v1/auth/auth.module';
import { CardsModule } from '@/v1/cards/cards.module';
import { TransactionsModule } from '@/v1/transactions/transactions.module';

export const versionRoutes: Routes = [
    {
        path: '/v1',
        module: V1Module,
        children: [
            { path: '/users', module: UsersModule },
            { path: '/auth', module: AuthModule },
            { path: '/cards', module: CardsModule },
            { path: '/transactions', module: TransactionsModule },
        ],
    },
];
