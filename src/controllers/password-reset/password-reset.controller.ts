/**
 * Password reset controller.
 * @packageDocumentation
 */

import { Controller, UseInterceptors, Post, Patch } from '@nestjs/common';
import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { UserService } from '../../services/user/user.service';
import { QueryString } from '../../decorators/query-string.decorator';
import { Hostname } from 'src/decorators/hostname.decorator';
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
  ) {
    const userExists = await this.userService.userExistsByEmail(email);

    if (userExists) {
      const user = await this.userService.getUserByEmail(email);

      const resetExists =
        await this.passwordResetService.passwordResetExistsByUserID(user.id);

      if (!resetExists) {
        const reset = await this.passwordResetService.createPasswordReset(
          user.id,
        );

        await sendFormattedEmail(email, 'Password Reset', 'password-reset', {
          hostname,
          resetID: reset.id,
        });
      }
    }
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
  ) {
    await this.passwordResetService.resetPassword(resetID, newPassword);
  }
}
