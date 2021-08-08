import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const port = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  await app.listen(port);
  console.log(`App running on port ${port}`);
}

bootstrap();
