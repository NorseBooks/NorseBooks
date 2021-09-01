import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

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
import { ImageController } from './controllers/image/image.controller';
import { UserController } from './controllers/user/user.controller';
import { VerifyController } from './controllers/verify/verify.controller';
import { PasswordResetController } from './controllers/password-reset/password-reset.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'app', 'dist', 'norsebooks'),
    }),
  ],
  controllers: [
    ResourceController,
    ImageController,
    UserController,
    VerifyController,
    PasswordResetController,
  ],
  providers: [
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
