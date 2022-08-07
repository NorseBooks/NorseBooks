import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { inputAppearance } from '../../globals';

/**
 * The request password reset form.
 */
interface RequestResetForm {
  email: string;
}

/**
 * The set password form.
 */
interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

/**
 * The password reset page.
 */
@Component({
  selector: 'nb-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  public emailMinLength = 1;
  public emailMaxLength = 1;
  public passwordMinLength = 1;
  public passwordMaxLength = 1;
  public resetID = '';
  public done = false;
  public doneRequesting = false;
  public doneResetting = false;
  public requestingReset = true;
  public validResetID = false;
  public resetRequestError = '';
  public setPasswordError = '';
  public submittingResetRequestForm = false;
  public submittingSetPasswordForm = false;
  public hidePassword = true;
  public hideConfirmPassword = true;
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.emailMinLength = await this.resourceService.get(
      'USER_EMAIL_MIN_LENGTH',
    );
    this.emailMaxLength = await this.resourceService.get(
      'USER_EMAIL_MAX_LENGTH',
    );
    this.passwordMinLength = await this.resourceService.get(
      'USER_PASSWORD_MIN_LENGTH',
    );
    this.passwordMaxLength = await this.resourceService.get(
      'USER_PASSWORD_MAX_LENGTH',
    );

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.resetID = paramMap.get('resetID') || '';

      if (this.resetID !== '') {
        this.requestingReset = false;
        this.validResetID = await this.passwordResetService.passwordResetExists(
          this.resetID,
        );
      }

      this.done = true;
    });
  }

  /**
   * Request a password reset.
   *
   * @param form The request password reset form.
   */
  public async onRequestReset(form: RequestResetForm): Promise<void> {
    this.resetRequestError = '';
    this.submittingResetRequestForm = true;

    try {
      this.passwordResetService.requestPasswordReset(form.email);
      this.doneRequesting = true;
    } catch (err: any) {
      this.resetRequestError = err;
    }

    this.submittingResetRequestForm = false;
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
        await this.passwordResetService.resetPassword(
          this.resetID,
          form.password,
        );
        this.doneResetting = true;
      } catch (err: any) {
        this.setPasswordError = err;
      }

      this.submittingSetPasswordForm = false;
    }
  }
}
