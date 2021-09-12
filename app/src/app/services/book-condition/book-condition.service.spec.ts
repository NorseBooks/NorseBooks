import { TestBed } from '@angular/core/testing';

import { BookConditionService } from './book-condition.service';

describe('BookConditionService', () => {
  let service: BookConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
