import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { inputAppearance } from '../../globals';

/**
 * The registration form.
 */
interface RegisterForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

/**
 * The registration page.
 */
@Component({
  selector: 'nb-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public firstnameMaxLength = 1;
  public lastnameMaxLength = 1;
  public emailMinLength = 1;
  public emailMaxLength = 1;
  public passwordMinLength = 1;
  public passwordMaxLength = 1;
  public submittingRegister = false;
  public registerError = '';
  public registerSuccess = false;
  public hidePassword = true;
  public hideConfirmPassword = true;
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.firstnameMaxLength = await this.resourceService.get(
      'USER_NAME_MAX_LENGTH',
    );
    this.lastnameMaxLength = await this.resourceService.get(
      'USER_NAME_MAX_LENGTH',
    );
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
  }

  /**
   * Register an account.
   *
   * @param form The registration form.
   */
  public async onRegister(form: RegisterForm): Promise<void> {
    if (form.password !== form.confirmPassword) {
      this.registerError = 'Passwords do not match';
    } else if (!form.terms) {
      this.registerError = 'Please agree to the terms and conditions';
    } else {
      this.registerError = '';
      this.submittingRegister = true;

      try {
        await this.userService.register(
          form.firstname,
          form.lastname,
          form.email,
          form.password,
        );

        this.registerError = '';
        this.registerSuccess = true;
      } catch (err: any) {
        this.registerError = err;
      }

      this.submittingRegister = false;
    }
  }
}
