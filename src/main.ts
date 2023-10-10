import { LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { AppConfiguration } from '@/shared/config/configuration';
import { PrismaClientExceptionFilter } from '@/shared/prisma/utils/PrismaClientExceptionFilter';

async function bootstrap() {
    const prodLogLevels: LogLevel[] = ['log', 'error', 'warn'];
    const devLogLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

    const logLevels = process.env.NODE_ENV === 'production' ? prodLogLevels : devLogLevels;

    const app = await NestFactory.create(AppModule, {
        cors: false,
        logger: logLevels,
    });

    const configService = app.get(ConfigService);
    const config = configService.get<AppConfiguration>('app');

    app.setGlobalPrefix(config.globalPrefix);

    // enable shutdown hook
    app.enableShutdownHooks();

    // Prisma Client Exception Filter for unhandled exceptions
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

    // Swagger Api
    if (config.swagger.enabled) {
        const options = new DocumentBuilder()
            .setTitle(config.swagger.title)
            .setDescription(config.swagger.description)
            .setVersion(config.swagger.version)
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, options);

        SwaggerModule.setup(config.swagger.path, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }

    // CORS
    if (config.cors.enabled) {
        app.enableCors({ credentials: true, origin: true });
    }

    await app.listen(config.port, config.hostname);
    if (config.NODE_ENV !== 'production') {
        console.info(`Documentation: http://${config.hostname}:${config.port}/${config.swagger.path}`);
        console.info(`Listening on http://${config.hostname}:${config.port}/${config.globalPrefix}`);
    }
}
bootstrap();
