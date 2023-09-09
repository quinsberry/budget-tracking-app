import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfiguration } from './shared/config/configuration';
import { LogLevel } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './shared/prisma/utils/PrismaClientExceptionFilter';

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

    await app.listen(3000);
}
bootstrap();
