import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { OtherUserInfo } from '../user/user.interface';

/**
 * User blocking service.
 */
@Injectable({
  providedIn: 'root',
})
export class BlockService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Block a user.
   *
   * @param userID The ID of the user being blocked.
   */
  public async blockUser(userID: string): Promise<void> {
    await this.apiService.post('block', { query: { userID } });
  }

  /**
   * Unblock a user.
   *
   * @param userID The ID of the blocked user.
   */
  public async unblockUser(userID: string): Promise<void> {
    await this.apiService.delete('block', { query: { userID } });
  }

  /**
   * Get whether or not a user is blocked.
   *
   * @param userID The ID of the other user.
   * @returns Whether or not the user is blocked.
   */
  public async isBlocked(userID: string): Promise<boolean> {
    return this.apiService.get<boolean>('block/blocked', { query: { userID } });
  }

  /**
   * Get whether or not the other user has the user blocked.
   *
   * @param userID The ID of the other user.
   * @returns Whether or not the other user has the user blocked.
   */
  public async hasBlocked(userID: string): Promise<boolean> {
    return this.apiService.get<boolean>('block/has-blocked', {
      query: { userID },
    });
  }

  /**
   * Get all blocked users.
   *
   * @returns All blocked users.
   */
  public async getBlockedUsers(): Promise<OtherUserInfo[]> {
    return this.apiService.get<OtherUserInfo[]>('block/blocked-users');
  }
}
