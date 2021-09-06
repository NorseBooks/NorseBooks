import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { APIService } from './services/api/api.service';
import { ResourceService } from './services/resource/resource.service';
import { UserService } from './services/user/user.service';
import { VerifyService } from './services/verify/verify.service';
import { PasswordResetService } from './services/password-reset/password-reset.service';
import { DepartmentService } from './services/department/department.service';
import { BookConditionService } from './services/book-condition/book-condition.service';
import { BookService } from './services/book/book.service';

/**
 * The app module.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
