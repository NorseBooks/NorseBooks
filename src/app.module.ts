import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DBService } from './services/db/db.service';
import { ResourceService } from './services/resource/resource.service';
import { ImageService } from './services/image/image.service';
import { UserService } from './services/user/user.service';
import { SessionService } from './services/session/session.service';
import { VerifyService } from './services/verify/verify.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'app', 'dist', 'norsebooks'),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DBService,
    ResourceService,
    ImageService,
    UserService,
    SessionService,
    VerifyService,
  ],
})
export class AppModule {}
