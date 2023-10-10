import { join } from 'path';

import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { configuration } from '@/shared/config/configuration';
import { envSchema } from '@/shared/config/validation';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { loggingMiddleware } from '@/shared/prisma/utils/LoggingMiddleware';
import { SharedModule } from '@/shared/shared.module';
import { V1Module } from '@/v1/v1.module';
import { versionRoutes } from '@/versions.router';

const envFileName = process.env.NODE_ENV === 'production' ? '.env.prod' : `.env`;
const envFilePath = join(process.cwd(), envFileName);
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath,
            load: [configuration],
            validate: envSchema.parse,
        }),
        PrismaModule.forRoot({
            isGlobal: true,
            prismaServiceOptions: {
                middlewares: [
                    loggingMiddleware({
                        logger: new Logger('PrismaMiddleware'),
                        logLevel: 'log',
                    }),
                ],
            },
        }),
        ScheduleModule.forRoot(),
        RouterModule.register(versionRoutes),
        SharedModule,
        V1Module,
    ],
    providers: [],
})
export class AppModule {}
