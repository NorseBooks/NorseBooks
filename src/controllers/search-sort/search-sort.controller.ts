import { Controller, UseInterceptors, Get } from '@nestjs/common';
import { SearchSortService } from '../../services/search-sort/search-sort.service';
import { QueryNumber } from '../../decorators/query-number.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Search sort controller.
 */
@Controller('api/search-sort')
@UseInterceptors(new ResponseInterceptor())
export class SearchSortController {
  constructor(private readonly searchSortService: SearchSortService) {}

  /**
   * Get a search sort option.
   *
   * @param sortID The sort option ID.
   * @returns The sort option.
   */
  @Get()
  public async getSortOption(@QueryNumber({ name: 'sortID' }) sortID: number) {
    return this.searchSortService.getSortOption(sortID);
  }

  /**
   * Get all search sort options.
   *
   * @returns All search sort options.
   */
  @Get('all')
  public async getSortOptions() {
    return this.searchSortService.getSortOptions();
  }
}
