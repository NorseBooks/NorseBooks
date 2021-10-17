import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ProfileComponent } from './components/profile/profile.component';
import { VerifyComponent } from './components/verify/verify.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { BookCreateComponent } from './components/book-create/book-create.component';
import { BookViewComponent } from './components/book-view/book-view.component';
import { BookEditComponent } from './components/book-edit/book-edit.component';
import { AboutComponent } from './components/about/about.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { MessageComponent } from './components/message/message.component';
import { MessageUserComponent } from './components/message-user/message-user.component';
import { CreditsComponent } from './components/credits/credits.component';
import { AdminComponent } from './components/admin/admin.component';
import { TermsComponent } from './components/terms/terms.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

/**
 * App routing configuration.
 */
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'verify/:verifyID', component: VerifyComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'password-reset/:resetID', component: PasswordResetComponent },
  { path: 'book', component: BookCreateComponent },
  { path: 'book/:bookID', component: BookViewComponent },
  { path: 'edit/:bookID', component: BookEditComponent },
  { path: 'about', component: AboutComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'message', component: MessageComponent },
  { path: 'message/:userID', component: MessageUserComponent },
  { path: 'credits', component: CreditsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', component: NotFoundComponent },
];

/**
 * The app routing module.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
