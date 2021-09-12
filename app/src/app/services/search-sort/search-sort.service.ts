import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBSearchSort } from './search-sort.interface';

/**
 * Search sort service.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchSortService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Get a search sort option.
   *
   * @param sortID The sort option ID.
   * @returns The sort option.
   */
  public async getSortOption(sortID: number): Promise<NBSearchSort> {
    return this.apiService.get<NBSearchSort>('search-sort', {
      query: { sortID },
    });
  }

  /**
   * Get all search sort options.
   *
   * @returns All search sort options.
   */
  public async getSortOptions(): Promise<NBSearchSort[]> {
    return this.apiService.get<NBSearchSort[]>('search-sort/all');
  }
}
