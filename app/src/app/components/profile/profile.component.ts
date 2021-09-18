import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { ReportService } from '../../services/report/report.service';
import { UserInfo } from '../../services/user/user.interface';
import { NBBook } from '../../services/book/book.interface';
import {
  inputAppearance,
  acceptImageTypes,
  wait,
  getUserImageURL,
} from '../../globals';

/**
 * The set password form.
 */
interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

/**
 * The user profile page.
 */
@Component({
  selector: 'nb-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public passwordMinLength = 1;
  public passwordMaxLength = 1;
  public done = false;
  public loggedIn = false;
  public userInfo!: UserInfo;
  public userImageURL = '';
  public userBooks: NBBook[] = [];
  public recommended: NBBook[] = [];
  public reported: NBBook[] = [];
  public submittingSetPasswordForm = false;
  public logoutEverywhereClicked = false;
  public setImageError = '';
  public setPasswordError = '';
  public logoutEverywhereError = '';
  public hidePassword = true;
  public hideConfirmPassword = true;
  public readonly inputAppearance = inputAppearance;
  public readonly acceptImageTypes = acceptImageTypes;

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly reportService: ReportService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.passwordMinLength = await this.resourceService.get(
      'USER_PASSWORD_MIN_LENGTH',
    );
    this.passwordMaxLength = await this.resourceService.get(
      'USER_PASSWORD_MAX_LENGTH',
    );
    this.loggedIn = this.userService.loggedIn();

    if (this.loggedIn) {
      try {
        this.userInfo = await this.userService.getUserInfo();
        this.userImageURL = getUserImageURL(this.userInfo);
        this.userBooks = await this.userService.getCurrentBooks();
        this.recommended = await this.userService.getRecommendations();
        this.reported = await this.reportService.getUserReportedBooks();
      } catch (err) {
        await this.userService.logout();
        this.loggedIn = false;
      }
    }

    this.done = true;

    if (this.loggedIn) {
      await wait(100);
      this.updateImage();
    }
  }

  /**
   * Update the user's image.
   */
  public updateImage(): void {
    this.userImageURL = getUserImageURL(this.userInfo);
    (document.getElementById('user-avatar') as HTMLImageElement).src =
      this.userImageURL;
  }

  /**
   * Set the user's image.
   *
   * @param imageData The image data.
   */
  public async setUserImage(imageData: string): Promise<void> {
    const b64Image = btoa(imageData);

    try {
      await this.userService.setImage(b64Image);
      this.userInfo = await this.userService.getUserInfo();
      this.updateImage();

      this.snackBar.open('Avatar set', undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    } catch (err: any) {
      this.setImageError = err;
    }
  }

  /**
   * Remove the user's image.
   */
  public async deleteUserImage(): Promise<void> {
    try {
      await this.userService.deleteImage();
      this.userInfo = await this.userService.getUserInfo();
      this.updateImage();

      this.snackBar.open('Avatar reset', undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    } catch (err: any) {
      this.setImageError = err;
    }
  }

  /**
   * Set the user's password.
   *
   * @param form The set password form.
   */
  public async onSetPassword(form: SetPasswordForm): Promise<void> {
    if (form.password !== form.confirmPassword) {
      this.setPasswordError = 'Passwords do not match';
    } else {
      this.setPasswordError = '';
      this.submittingSetPasswordForm = true;

      try {
        await this.userService.setPassword(form.password);

        this.snackBar.open('Password changed', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });
      } catch (err: any) {
        this.setPasswordError = err;
      }

      this.submittingSetPasswordForm = false;
    }
  }

  /**
   * Log out everywhere.
   */
  public async logoutEverywhere(): Promise<void> {
    this.logoutEverywhereError = '';
    this.logoutEverywhereClicked = true;

    try {
      await this.userService.logoutEverywhere();
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.logoutEverywhereClicked = false;
      this.logoutEverywhereError = err;
    }
  }
}