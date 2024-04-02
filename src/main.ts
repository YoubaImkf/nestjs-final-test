import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    const config = new DocumentBuilder()
        .setTitle('Auth API')
        .setDescription(
            `The Auth API description http://localhost:3000/api-json`,
        )
        .setVersion('1.0')
        .addTag('user')
        .addTag('task')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}/swagger`);
}
bootstrap().then();
