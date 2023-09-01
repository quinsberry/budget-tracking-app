import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { V1Module } from './v1/v1.module';
import { RouterModule } from '@nestjs/core';
import { versionRoutes } from './versions.router';
import path from 'path';
import { configuration } from './shared/config/configuration';
import { envSchema } from './shared/config/validation';


const envFileName = process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`;
const envFilePath = path.join(process.cwd(), envFileName);
@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath,
        load: [configuration],
        validate: envSchema.parse,
    }),
    RouterModule.register(versionRoutes),
    V1Module,
  ],
})
export class AppModule {}
