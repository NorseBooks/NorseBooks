import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { inputAppearance } from '../../globals';

/**
 * The login form.
 */
interface LoginForm {
  email: string;
  password: string;
}

/**
 * The login page.
 */
@Component({
  selector: 'nb-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public after = '';
  public emailMinLength = 1;
  public emailMaxLength = 1;
  public passwordMinLength = 1;
  public passwordMaxLength = 1;
  public submittingLogin = false;
  public loginError = '';
  public hidePassword = true;
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      this.after = queryParams.get('after') || '';
    });

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
   * Log in.
   *
   * @param form The login form.
   */
  public async onLogin(form: LoginForm): Promise<void> {
    this.loginError = '';
    this.submittingLogin = true;

    try {
      await this.userService.login(form.email, form.password);

      this.loginError = '';

      await this.router.navigate([this.after || '/']);
    } catch (err: any) {
      this.loginError = err;
    }

    this.submittingLogin = false;
  }
}
