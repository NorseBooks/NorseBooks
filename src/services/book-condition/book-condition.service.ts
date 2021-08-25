import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { NBBookCondition } from './book-condition.interface';
import { ServiceException } from '../service.exception';

/**
 * Book condition table name.
 */
export const bookConditionTableName = 'NB_BOOK_CONDITION';

/**
 * Book condition table service.
 */
@Injectable()
export class BookConditionService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
  ) {}

  /**
   * Determine whether or not a book condition exists.
   *
   * @param conditionID The book condition's ID.
   * @params Whether or not the book condition exists.
   */
  public async bookConditionExists(conditionID: number): Promise<boolean> {
    const bookCondition = await this.dbService.getByID<NBBookCondition>(
      bookConditionTableName,
      conditionID,
    );
    return !!bookCondition;
  }

  /**
   * Determine whether or not a book condition exists.
   *
   * @param conditionName Thhe book condition's name.
   * @returns Whether or not the book condition exists.
   */
  public async bookConditionExistsByName(
    conditionName: string,
  ): Promise<boolean> {
    const bookCondition = await this.dbService.getByFields<NBBookCondition>(
      bookConditionTableName,
      { name: conditionName },
    );
    return !!bookCondition;
  }

  /**
   * Get the name of a book condition.
   *
   * @param conditionID The book condition's ID.
   * @return The name of the book condition.
   */
  public async getBookConditionName(conditionID: number): Promise<string> {
    const bookCondition = await this.dbService.getByID<NBBookCondition>(
      bookConditionTableName,
      conditionID,
    );

    if (bookCondition) {
      return bookCondition.name;
    } else {
      throw new ServiceException('Book condition does not exist');
    }
  }

  /**
   * Get all book conditions.
   *
   * @returns All book conditions.
   */
  public async getBookConditions(): Promise<NBBookCondition[]> {
    const bookConditions = await this.dbService.list<NBBookCondition>(
      bookConditionTableName,
      { fieldName: 'id', sortOrder: 'ASC' },
    );
    return bookConditions;
  }
}
