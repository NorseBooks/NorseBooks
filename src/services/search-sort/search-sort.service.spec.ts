import { SearchSortService } from './search-sort.service';
import { getService } from '../test-util';
import { ServiceException } from '../service.exception';

describe('SearchSortService', () => {
  let searchSortService: SearchSortService;

  beforeAll(async () => {
    searchSortService = await getService(SearchSortService);
  });

  it('should check if a search sort option exists', async () => {
    // check existence
    const exists1 = await searchSortService.sortOptionExists(2);
    expect(exists1).toBeTruthy();
    const exists2 = await searchSortService.sortOptionExists(-1);
    expect(exists2).toBeFalsy();
  });

  it('should get a search sort option', async () => {
    // get
    const sortOption1 = await searchSortService.getSortOption(3);
    expect(sortOption1).toBeDefined();
    expect(sortOption1).toHaveProperty('id', 3);
    expect(sortOption1).toHaveProperty('name', 'Title (Z-A)');
    expect(sortOption1).toHaveProperty('query', '"title" DESC');
    await expect(searchSortService.getSortOption(-1)).rejects.toThrow(
      ServiceException,
    );
  });

  it('should get all search options', async () => {
    // get all
    const sortOptions = await searchSortService.getSortOptions();
    expect(sortOptions).toBeDefined();
    expect(sortOptions.length).toBeGreaterThan(0);
    expect(sortOptions[0]).toHaveProperty('id', 0);
    expect(sortOptions[0]).toHaveProperty('name', 'Newest');
    expect(sortOptions[0]).toHaveProperty('query', '"listTime" DESC');
  });
});
