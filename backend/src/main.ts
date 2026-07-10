import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL ?? '',
    ].filter(Boolean),
    credentials: true,
  });
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  await app.listen(process.env.PORT ?? 8080);
}

void bootstrap();
