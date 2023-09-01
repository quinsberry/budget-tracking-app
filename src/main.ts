import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfiguration } from './shared/config/configuration';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: false });

    const configService = app.get(ConfigService);
    const config = configService.get<AppConfiguration>('app');

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
