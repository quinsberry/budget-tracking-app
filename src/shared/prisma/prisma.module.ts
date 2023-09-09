import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

const PRISMA_SERVICE_OPTIONS = 'PRISMA_SERVICE_OPTIONS';

@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {
    static forRoot(options: PrismaModuleOptions = {}): DynamicModule {
        return {
            global: options.isGlobal,
            module: PrismaModule,
            providers: [
                {
                    provide: PRISMA_SERVICE_OPTIONS,
                    useValue: options.prismaServiceOptions,
                },
            ],
        };
    }
}
export interface PrismaModuleOptions {
    isGlobal?: boolean;
    prismaServiceOptions?: PrismaServiceOptions;
}

export interface PrismaServiceOptions {
    prismaOptions?: Prisma.PrismaClientOptions;
    explicitConnect?: boolean;
    middlewares?: Array<Prisma.Middleware>;
}
