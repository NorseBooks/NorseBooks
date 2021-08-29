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
import { PasswordResetService } from './services/password-reset/password-reset.service';
import { DepartmentService } from './services/department/department.service';
import { BookConditionService } from './services/book-condition/book-condition.service';
import { BookService } from './services/book/book.service';
import { ReportService } from './services/report/report.service';
import { MessageService } from './services/message/message.service';
import { SearchSortService } from './services/search-sort/search-sort.service';
import { FeedbackService } from './services/feedback/feedback.service';
import { UserInterestService } from './services/user-interest/user-interest.service';
import { ReferralService } from './services/referral/referral.service';

import { ResourceController } from './controllers/resource/resource.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'app', 'dist', 'norsebooks'),
    }),
  ],
  controllers: [AppController, ResourceController],
  providers: [
    AppService,
    DBService,
    ResourceService,
    ImageService,
    UserService,
    SessionService,
    VerifyService,
    PasswordResetService,
    DepartmentService,
    BookConditionService,
    BookService,
    ReportService,
    MessageService,
    SearchSortService,
    FeedbackService,
    UserInterestService,
    ReferralService,
  ],
})
export class AppModule {}
