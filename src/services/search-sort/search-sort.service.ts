import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { NBSearchSort } from './search-sort.interface';
import { ServiceException } from '../service.exception';

/**
 * Search sort table name.
 */
export const searchSortTableName = 'NB_SEARCH_SORT';

/**
 * Search sort table service.
 */
@Injectable()
export class SearchSortService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
  ) {}

  /**
   * Determine whether or not a search sort option exists.
   *
   * @param sortID The sort option ID.
   * @returns Whether or not the search sort option exists.
   */
  public async sortOptionExists(sortID: number): Promise<boolean> {
    const sortOption = await this.dbService.getByID<NBSearchSort>(
      searchSortTableName,
      sortID,
    );
    return !!sortOption;
  }

  /**
   * Get a search sort option.
   *
   * @param sortID The sort option ID.
   * @returns The search sort option.
   */
  public async getSortOption(sortID: number): Promise<NBSearchSort> {
    const sortOption = await this.dbService.getByID<NBSearchSort>(
      searchSortTableName,
      sortID,
    );

    if (sortOption) {
      return sortOption;
    } else {
      throw new ServiceException('Search sort option does not exist');
    }
  }

  /**
   * Get all search sort options.
   */
  public async getSortOptions(): Promise<NBSearchSort[]> {
    return this.dbService.list<NBSearchSort>(searchSortTableName, {
      fieldName: 'id',
      sortOrder: 'ASC',
    });
  }
}
