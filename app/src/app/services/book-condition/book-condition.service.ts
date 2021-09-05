import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBBookCondition } from './book-condition.interface';

/**
 * Book condition service.
 */
@Injectable({
  providedIn: 'root',
})
export class BookConditionService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Get the name of a book condition.
   *
   * @param conditionID The condition ID.
   * @returns The name of the book condition.
   */
  public async getBookCondition(conditionID: number): Promise<string> {
    return this.apiService.get<string>('book-condition', {
      query: { conditionID },
    });
  }

  /**
   * Get all book conditions.
   *
   * @returns All book conditions.
   */
  public async getBookConditions(): Promise<NBBookCondition[]> {
    return this.apiService.get<NBBookCondition[]>('book-condition/all');
  }
}
