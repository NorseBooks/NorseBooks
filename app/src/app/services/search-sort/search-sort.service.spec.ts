import { TestBed } from '@angular/core/testing';

import { SearchSortService } from './search-sort.service';

describe('SearchSortService', () => {
  let service: SearchSortService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchSortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
