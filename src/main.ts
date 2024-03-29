/**
 * The app entry point.
 * @packageDocumentation
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as enforce from 'express-sslify';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { autoBackupDB } from './backup';

/**
 * Debug/production environment.
 */
const debug = !!parseInt(process.env.DEBUG);

/**
 * Port number.
 */
const port = process.env.PORT || 3000;

/**
 * Mark not testing.
 */
process.env.TESTING = '0';

/**
 * Database URL.
 */
const dbURL = process.env.DATABASE_URL;

/**
 * Bootstrap the application.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  if (!debug) {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
  }

  app.use(cookieParser());

  app.use(json({ limit: '16mb' }));
  app.use(urlencoded({ limit: '16mb', extended: true }));

  await autoBackupDB(dbURL);

  await app.listen(port);
  console.log(`App running on port ${port}`);
}

bootstrap();
