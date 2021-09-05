import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';

/**
 * Verify service.
 */
@Injectable({
  providedIn: 'root',
})
export class VerifyService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Verify a user's account.
   *
   * @param verifyID The verification ID.
   */
  public async verify(verifyID: string): Promise<void> {
    await this.apiService.patch('verify', { query: { verifyID } });
  }
}
