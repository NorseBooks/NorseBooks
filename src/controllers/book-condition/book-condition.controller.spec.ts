/**
 * Book condition controller tests.
 * @packageDocumentation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BookConditionController } from './book-condition.controller';

describe('BookConditionController', () => {
  let controller: BookConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookConditionController],
    }).compile();

    controller = module.get<BookConditionController>(BookConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
