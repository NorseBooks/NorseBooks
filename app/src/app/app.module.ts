import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FileInputComponent } from './components/file-input/file-input.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { VerifyComponent } from './components/verify/verify.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { BookCreateComponent } from './components/book-create/book-create.component';
import { BookViewComponent } from './components/book-view/book-view.component';
import { Dialog, DialogComponent } from './components/dialog/dialog.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { BookEditComponent } from './components/book-edit/book-edit.component';
import { AboutComponent } from './components/about/about.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { MessageComponent } from './components/message/message.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { MessageUserComponent } from './components/message-user/message-user.component';
import { CreditsComponent } from './components/credits/credits.component';

/**
 * The app module.
 */
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    LogoutComponent,
    ProfileComponent,
    FileInputComponent,
    NotFoundComponent,
    VerifyComponent,
    PasswordResetComponent,
    BookCreateComponent,
    BookViewComponent,
    Dialog,
    DialogComponent,
    BookListComponent,
    UnauthorizedComponent,
    ForbiddenComponent,
    BookEditComponent,
    AboutComponent,
    FeedbackComponent,
    MessageComponent,
    AvatarComponent,
    MessageUserComponent,
    CreditsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
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
