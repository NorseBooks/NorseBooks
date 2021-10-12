/**
 * The app module.
 * @packageDocumentation
 */

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
import { BlockService } from './services/block/block.service';
import { AdminService } from './services/admin/admin.service';

import { ResourceController } from './controllers/resource/resource.controller';
import { ImageController } from './controllers/image/image.controller';
import { UserController } from './controllers/user/user.controller';
import { VerifyController } from './controllers/verify/verify.controller';
import { PasswordResetController } from './controllers/password-reset/password-reset.controller';
import { DepartmentController } from './controllers/department/department.controller';
import { BookConditionController } from './controllers/book-condition/book-condition.controller';
import { BookController } from './controllers/book/book.controller';
import { ReportController } from './controllers/report/report.controller';
import { MessageController } from './controllers/message/message.controller';
import { SearchSortController } from './controllers/search-sort/search-sort.controller';
import { FeedbackController } from './controllers/feedback/feedback.controller';
import { UserInterestController } from './controllers/user-interest/user-interest.controller';
import { ReferralController } from './controllers/referral/referral.controller';
import { BlockController } from './controllers/block/block.controller';
import { AdminController } from './controllers/admin/admin.controller';

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
    DepartmentController,
    BookConditionController,
    BookController,
    ReportController,
    MessageController,
    SearchSortController,
    FeedbackController,
    UserInterestController,
    ReferralController,
    BlockController,
    AdminController,
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
    BlockService,
    AdminService,
  ],
})
export class AppModule {}
