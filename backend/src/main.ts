import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // CORS: permite que el frontend Vue (otro puerto) consuma la API
  const origenes = (config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173').split(',');
  app.enableCors({ origin: origenes });

  // ValidationPipe global: aplica las reglas de class-validator de los DTO
  //  - whitelist: elimina propiedades que no están en el DTO
  //  - forbidNonWhitelisted: responde 400 si llegan propiedades extra
  //  - transform: convierte el body al tipo del DTO
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Swagger en /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GameHub IPVG API')
    .setDescription(
      'API REST para torneos de videojuegos y eSports del IPVG. ' +
        'Para probar endpoints protegidos: POST /auth/login, copiar access_token y presionar "Authorize".',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documento = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documento, {
    swaggerOptions: { persistAuthorization: true },
  });

  const puerto = Number(config.get('PORT', 3000));
  await app.listen(puerto);
  console.log(`API GameHub IPVG en http://localhost:${puerto}  |  Swagger: http://localhost:${puerto}/docs`);
}
bootstrap();
