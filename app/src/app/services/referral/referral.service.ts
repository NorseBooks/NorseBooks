import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBReferral } from './referral.interface';

/**
 * Referral service.
 */
@Injectable({
  providedIn: 'root',
})
export class ReferralService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Refer a user.
   *
   * @param userID The user's ID.
   * @returns The new referral.
   */
  public async referUser(userID: string): Promise<NBReferral> {
    return this.apiService.post<NBReferral>('referral', { query: { userID } });
  }

  /**
   * Get the user's referral record.
   *
   * @returns The user referral.
   */
  public async getReferral(): Promise<NBReferral> {
    return this.apiService.get<NBReferral>('referral');
  }

  /**
   * Get all referrals associated with a user.
   *
   * @param userID The user's ID.
   * @returns All referral records associated with the user.
   */
  public async getReferrals(userID: string): Promise<NBReferral[]> {
    return this.apiService.get<NBReferral[]>('referral/user-referrals', {
      query: { userID },
    });
  }

  /**
   * Get whether or not the user has reached the referral threshold.
   *
   * @returns Whether or not the user has reached the referral threshold.
   */
  public async reachedReferralThreshold(): Promise<boolean> {
    return this.apiService.get<boolean>('referral/reached-threshold');
  }
}
