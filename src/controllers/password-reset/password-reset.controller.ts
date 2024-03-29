/**
 * Password reset controller.
 * @packageDocumentation
 */

import { Controller, UseInterceptors, Post, Patch, Get } from '@nestjs/common';
import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { UserService } from '../../services/user/user.service';
import { QueryString } from '../../decorators/query-string.decorator';
import { Hostname } from '../../decorators/hostname.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { sendFormattedEmail } from '../../emailer';

/**
 * Password reset controller.
 */
@Controller('api/password-reset')
@UseInterceptors(new ResponseInterceptor())
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
    private readonly userService: UserService,
  ) {}

  /**
   * Request a password reset.
   *
   * @param email The user's email address.
   */
  @Post()
  public async requestPasswordReset(
    @QueryString({ name: 'email' }) email: string,
    @Hostname() hostname: string,
  ): Promise<void> {
    const emailAddress = email.includes('@') ? email : `${email}@luther.edu`;

    const userExists = await this.userService.userExistsByEmail(emailAddress);

    if (userExists) {
      const user = await this.userService.getUserByEmail(emailAddress);

      const resetExists =
        await this.passwordResetService.passwordResetExistsByUserID(user.id);

      if (!resetExists) {
        const reset = await this.passwordResetService.createPasswordReset(
          user.id,
        );

        await sendFormattedEmail(
          emailAddress,
          'Password Reset',
          'password-reset',
          {
            hostname,
            resetID: reset.id,
          },
        );
      }
    }
  }

  /**
   * Get whether or not the password reset record exists.
   *
   * @param resetID The password reset ID.
   * @returns Whether or not the password reset record exists.
   */
  @Get('exists')
  public async passwordResetExists(
    @QueryString({ name: 'resetID' }) resetID: string,
  ): Promise<boolean> {
    return this.passwordResetService.passwordResetExists(resetID);
  }

  /**
   * Reset a user's password.
   *
   * @param resetID The password reset ID.
   * @param newPassword The user's new password.
   */
  @Patch()
  public async resetPassword(
    @QueryString({ name: 'resetID' }) resetID: string,
    @QueryString({ name: 'newPassword' }) newPassword: string,
  ): Promise<void> {
    await this.passwordResetService.resetPassword(resetID, newPassword);
  }
}
