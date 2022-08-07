/**
 * User interest service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { UserService } from '../user/user.service';
import { DepartmentService } from '../department/department.service';
import { NBUserInterest } from './user-interest.interface';
import { ServiceException } from '../service.exception';

/**
 * User interest table name.
 */
export const userInterestTableName = 'NB_USER_INTEREST';

/**
 * User interest table service.
 */
@Injectable()
export class UserInterestService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
  ) {}

  /**
   * Note a user's interest in a department.
   *
   * @param userID The user's ID.
   * @param departmentID The department's ID.
   * @returns The new user interest record.
   */
  public async noteInterest(
    userID: string,
    departmentID: number,
  ): Promise<NBUserInterest> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const departmentExists = await this.departmentService.departmentExists(
        departmentID,
      );

      if (departmentExists) {
        await this.dropInterest(userID, departmentID);

        return this.dbService.create<NBUserInterest>(userInterestTableName, {
          userID,
          departmentID,
        });
      } else {
        throw new ServiceException('Department does not exist');
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a user is interested in a department.
   *
   * @param userID The user's ID.
   * @param departmentID The department's ID.
   * @returns Whether or not the user is interested in the department.
   */
  public async isInterested(
    userID: string,
    departmentID: number,
  ): Promise<boolean> {
    const userInterest = await this.dbService.getByFields<NBUserInterest>(
      userInterestTableName,
      { userID, departmentID },
    );
    return !!userInterest;
  }

  /**
   * Get all of a user's departmental interests.
   *
   * @param userID The user's ID.
   * @returns All of the user's departmental interests.
   */
  public async getUserInterests(userID: string): Promise<NBUserInterest[]> {
    return this.dbService.listByFields<NBUserInterest>(
      userInterestTableName,
      { userID },
      { fieldName: 'interestTime', sortOrder: 'ASC' },
    );
  }

  /**
   * Delete a user's interest in a department.
   *
   * @param userID The user's ID.
   * @param departmentID The department's ID.
   */
  public async dropInterest(
    userID: string,
    departmentID: number,
  ): Promise<void> {
    await this.dbService.deleteByFields(userInterestTableName, {
      userID,
      departmentID,
    });
  }
}
