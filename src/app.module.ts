import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { V1Module } from './v1/v1.module';
import { RouterModule } from '@nestjs/core';
import { versionRoutes } from './versions.router';
import { join } from 'path';
import { configuration } from './shared/config/configuration';
import { envSchema } from './shared/config/validation';
import { UsersModule } from './v1/users/users.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { loggingMiddleware } from './shared/prisma/utils/LoggingMiddleware';


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
    RouterModule.register(versionRoutes),
    V1Module,
    UsersModule,
  ],
})
export class AppModule {}
