import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';

/**
 * Password reset service.
 */
@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Request a password reset.
   *
   * @param email The user's email address.
   */
  public async requestPasswordReset(email: string): Promise<void> {
    await this.apiService.post('password-reset', { query: { email } });
  }

  /**
   * Get whether or not the password reset record exists.
   *
   * @param resetID The password reset ID.
   * @returns Whether or not the password reset record exists.
   */
  public async passwordResetExists(resetID: string): Promise<boolean> {
    return this.apiService.get('password-reset/exists', { query: { resetID } });
  }

  /**
   * Reset a user's password.
   *
   * @param resetID The password reset ID.
   * @param newPassword The user's new password.
   */
  public async resetPassword(
    resetID: string,
    newPassword: string,
  ): Promise<void> {
    await this.apiService.patch('password-reset', {
      query: { resetID, newPassword },
    });
  }
}
