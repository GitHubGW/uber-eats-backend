import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  await app.listen(4000);
}

bootstrap();
