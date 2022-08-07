/**
 * Search sort controller tests.
 * @packageDocumentation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SearchSortController } from './search-sort.controller';

describe('SearchSortController', () => {
  let controller: SearchSortController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchSortController],
    }).compile();

    controller = module.get<SearchSortController>(SearchSortController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
