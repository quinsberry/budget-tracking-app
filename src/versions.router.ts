import { Routes } from '@nestjs/core';
import { V1Module } from './v1/v1.module';
import { UsersModule } from './v1/users/users.module';

export const versionRoutes: Routes = [
    {
        path: '/v1',
        module: V1Module,
        children: [
            { path: '/users', module: UsersModule },
        ],
    },
];
