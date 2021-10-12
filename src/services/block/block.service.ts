/**
 * User blocking service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { UserService, userTableName } from '../user/user.service';
import { NBBlock } from './block.interface';
import { NBUser } from '../user/user.interface';
import { ServiceException } from '../service.exception';

/**
 * User blocking table name.
 */
export const blockTableName = 'NB_BLOCK';

/**
 * User blocking table service.
 */
@Injectable()
export class BlockService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Block a user.
   *
   * @param userID The user's ID.
   * @param blockedUserID The ID of the user being blocked.
   * @returns The block record.
   */
  public async blockUser(
    userID: string,
    blockedUserID: string,
  ): Promise<NBBlock> {
    const userExists = await this.userService.userExists(userID);
    const blockedUserExists = await this.userService.userExists(blockedUserID);

    if (userExists && blockedUserExists) {
      if (userID !== blockedUserID) {
        const blocked = await this.isBlocked(userID, blockedUserID);

        if (!blocked) {
          return this.dbService.create<NBBlock>(blockTableName, {
            userID,
            blockedUserID,
          });
        } else {
          return this.dbService.getByFields<NBBlock>(blockTableName, {
            userID,
            blockedUserID,
          });
        }
      } else {
        throw new ServiceException('Users cannot block themselves');
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Unblock a user.
   *
   * @param userID The user's ID.
   * @param blockedUserID The blocked user's ID.
   */
  public async unblockUser(
    userID: string,
    blockedUserID: string,
  ): Promise<void> {
    await this.dbService.deleteByFields(blockTableName, {
      userID,
      blockedUserID,
    });
  }

  /**
   * Determine whether or not a user is blocked.
   *
   * @param userID The user's ID.
   * @param otherUserID The other user's ID.
   * @returns Whether or not the user is blocked.
   */
  public async isBlocked(
    userID: string,
    otherUserID: string,
  ): Promise<boolean> {
    const block = await this.dbService.getByFields<NBBlock>(blockTableName, {
      userID,
      blockedUserID: otherUserID,
    });
    return !!block;
  }

  /**
   * Determine whether or not the other user has the user blocked.
   *
   * @param userID The user's ID.
   * @param otherUserID The other user's ID.
   * @returns Whether or not the other user has the user blocked.
   */
  public async hasBlocked(
    userID: string,
    otherUserID: string,
  ): Promise<boolean> {
    const block = await this.dbService.getByFields<NBBlock>(blockTableName, {
      userID: otherUserID,
      blockedUserID: userID,
    });
    return !!block;
  }

  /**
   * Get all of a user's block records.
   *
   * @param userID The user's ID.
   * @returns All of the user's block records.
   */
  public async getBlocks(userID: string): Promise<NBBlock[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      return this.dbService.listByFields<NBBlock>(blockTableName, { userID });
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get all of the users a user has blocked.
   *
   * @param userID The user's ID.
   * @returns All of the users the user has blocked.
   */
  public async getBlockedUsers(userID: string): Promise<NBUser[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const sql = `
        SELECT "${userTableName}".*
          FROM "${blockTableName}"
          JOIN "${userTableName}"
            ON "${blockTableName}"."blockedUserID" = "${userTableName}"."id"
          WHERE "${blockTableName}"."userID" = ?;
      `;
      const params = [userID];
      return this.dbService.execute<NBUser>(sql, params);
    } else {
      throw new ServiceException('User does not exist');
    }
  }
}
