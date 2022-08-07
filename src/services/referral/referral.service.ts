/**
 * Referral service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { NBReferral } from './referral.interface';
import { ServiceException } from '../service.exception';

/**
 * Referral table name.
 */
export const referralTableName = 'NB_REFERRAL';

/**
 * Referral table service.
 */
@Injectable()
export class ReferralService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Refer a user.
   *
   * @param userID The user's ID.
   * @param newUserID The new user's ID.
   * @returns The new referral record.
   */
  public async referUser(
    userID: string,
    newUserID: string,
  ): Promise<NBReferral> {
    const userExists = await this.userService.userExists(userID);
    const newUserExists = await this.userService.userExists(newUserID);

    if (userExists && newUserExists) {
      const referral = await this.getReferral(newUserID);

      if (!referral) {
        if (userID !== newUserID) {
          return this.dbService.create<NBReferral>(referralTableName, {
            userID,
            newUserID,
          });
        } else {
          throw new ServiceException('Users cannot refer themselves');
        }
      } else {
        throw new ServiceException('A user has already referred');
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get the referral record for a user, or undefined if they did not refer someone.
   *
   * @param newUserID The new user's ID.
   * @returns The referral record.
   */
  public async getReferral(newUserID: string): Promise<NBReferral | undefined> {
    const newUserExists = await this.userService.userExists(newUserID);

    if (newUserExists) {
      return this.dbService.getByFields<NBReferral>(referralTableName, {
        newUserID,
      });
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get all referral records associated with a user.
   *
   * @param userID The user's ID.
   * @returns All referral records associated with the user.
   */
  public async getReferrals(userID: string): Promise<NBReferral[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      return this.dbService.listByFields<NBReferral>(
        referralTableName,
        { userID },
        { fieldName: 'referTime', sortOrder: 'ASC' },
      );
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a user has reached the referral threshold.
   *
   * @param userID The user's ID.
   * @returns Whether or not the user has reached the referral threshold.
   */
  public async reachedReferralThreshold(userID: string): Promise<boolean> {
    const referralThreshold = await this.resourceService.getResource<number>(
      'REFERRAL_THRESHOLD',
    );

    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const referrals = await this.getReferrals(userID);

      return referrals.length >= referralThreshold;
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Delete a user's referral record.
   *
   * @param newUserID The new user's ID.
   */
  public async deleteReferral(newUserID: string): Promise<void> {
    await this.dbService.deleteByFields(referralTableName, {
      newUserID,
    });
  }

  /**
   * Delete all referral records associated with a user.
   *
   * @param userID The user's ID.
   */
  public async deleteUserReferrals(userID: string): Promise<void> {
    await this.dbService.deleteByFields(referralTableName, { userID });
  }
}
