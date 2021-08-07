import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBService } from './db/db.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'app', 'dist', 'norsebooks'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DBService],
})
export class AppModule {}
