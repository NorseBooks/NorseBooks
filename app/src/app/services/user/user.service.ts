import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { UserInfo, OtherUserInfo } from './user.interface';
import { NBBook } from '../book/book.interface';

/**
 * User service.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Register an account.
   *
   * @param firstname The user's first name.
   * @param lastname The user's last name.
   * @param email The user's email address.
   * @param password The user's password.
   */
  public async register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.apiService.post('user/register', {
      query: { firstname, lastname, email, password },
    });
  }

  /**
   * Log in.
   *
   * @param email The user's email address.
   * @param password The user's password.
   */
  public async login(email: string, password: string): Promise<void> {
    await this.apiService.post('user/login', { query: { email, password } });
  }

  /**
   * Log out.
   */
  public async logout(): Promise<void> {
    await this.apiService.delete('logout');
  }

  /**
   * Log out everywhere.
   */
  public async logoutEverywhere(): Promise<void> {
    await this.apiService.delete('logout-everywhere');
  }

  /**
   * Get the logged in user's details.
   *
   * @returns The user's info.
   */
  public async getUserInfo(): Promise<UserInfo> {
    return this.apiService.get<UserInfo>('user');
  }

  /**
   * Get another user's info.
   *
   * @param userID The other user's ID.
   * @returns The other user's info.
   */
  public async getOtherUserInfo(userID: string): Promise<OtherUserInfo> {
    return this.apiService.get<OtherUserInfo>('user/other', {
      query: { userID },
    });
  }

  /**
   * Get all books currently listed by the user.
   *
   * @returns The user's currently listed books.
   */
  public async getCurrentBooks(): Promise<NBBook[]> {
    return this.apiService.get<NBBook[]>('user/books');
  }

  /**
   * Set the user's password.
   *
   * @param newPassword The new password.
   */
  public async setPassword(newPassword: string): Promise<void> {
    await this.apiService.patch('user/password', { query: { newPassword } });
  }

  /**
   * Set the user's image.
   *
   * @param imageData The image data.
   */
  public async setImage(imageData: string): Promise<void> {
    await this.apiService.patch('user/image', { query: { imageData } });
  }

  /**
   * Delete the user's image.
   */
  public async deleteImage(): Promise<void> {
    await this.apiService.delete('user/image');
  }

  /**
   * Get recommended books for the user.
   *
   * @returns All books recommended to the user.
   */
  public async getRecommendations(): Promise<NBBook[]> {
    return this.apiService.get<NBBook[]>('user/recommendations');
  }
}
