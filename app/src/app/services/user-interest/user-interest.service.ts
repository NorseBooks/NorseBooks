import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBUserInterest } from './user-interest.interface';

/**
 * User interest service.
 */
@Injectable({
  providedIn: 'root',
})
export class UserInterestService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Note the user's interest in a department.
   *
   * @param departmentID The department's ID.
   * @returns The new user interest.
   */
  public async noteInterest(departmentID: number): Promise<NBUserInterest> {
    return this.apiService.post<NBUserInterest>('user-interest', {
      query: { departmentID },
    });
  }

  /**
   * Get whether or not the user is interested in the department.
   *
   * @param departmentID The department's ID.
   * @returns Whether or not the user is interested in the department.
   */
  public async isInterested(departmentID: number): Promise<boolean> {
    return this.apiService.get<boolean>('user-interest/interested', {
      query: { departmentID },
    });
  }

  /**
   * Get all of the user's interests.
   *
   * @returns All of the user's interests.
   */
  public async getInterests(): Promise<NBUserInterest[]> {
    return this.apiService.get<NBUserInterest[]>('user-interest');
  }

  /**
   * Delete a user's interest in a department.
   *
   * @param departmentID The department's ID.
   */
  public async dropInterest(departmentID: number): Promise<void> {
    await this.apiService.delete('user-interest', { query: { departmentID } });
  }
}
