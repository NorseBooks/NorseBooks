/**
 * Book condition controller.
 * @packageDocumentation
 */

import { Controller, UseInterceptors, Get } from '@nestjs/common';
import { BookConditionService } from '../../services/book-condition/book-condition.service';
import { NBBookCondition } from '../../services/book-condition/book-condition.interface';
import { QueryNumber } from '../../decorators/query-number.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Book condition controller.
 */
@Controller('api/book-condition')
@UseInterceptors(new ResponseInterceptor())
export class BookConditionController {
  constructor(private readonly bookConditionService: BookConditionService) {}

  /**
   * Get the name of a book condition.
   *
   * @param conditionID The condition ID.
   * @returns The name of the book condition.
   */
  @Get()
  public async getBookCondition(
    @QueryNumber({ name: 'conditionID' }) conditionID: number,
  ): Promise<string> {
    return this.bookConditionService.getBookConditionName(conditionID);
  }

  /**
   * Get all book conditions.
   *
   * @returns All book conditions.
   */
  @Get('all')
  public async getBookConditions(): Promise<NBBookCondition[]> {
    return this.bookConditionService.getBookConditions();
  }
}
