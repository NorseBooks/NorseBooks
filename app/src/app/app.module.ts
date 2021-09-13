import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { APIService } from './services/api/api.service';
import { ResourceService } from './services/resource/resource.service';
import { UserService } from './services/user/user.service';
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

import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';

/**
 * The app module.
 */
@NgModule({
  declarations: [AppComponent, HeaderComponent, HomeComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  providers: [
    APIService,
    ResourceService,
    UserService,
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
  bootstrap: [AppComponent],
})
export class AppModule {}
