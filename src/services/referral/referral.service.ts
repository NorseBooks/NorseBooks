import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { NBReferral } from './referral.interface';
import { ServiceException } from '../service.exception';

/**
 * Referral table service.
 */
@Injectable()
export class ReferralService {
  private readonly tableName = 'NB_REFERRAL';

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
        return this.dbService.create<NBReferral>(this.tableName, {
          userID,
          newUserID,
        });
      } else {
        throw new ServiceException('User has already been referred');
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
      return this.dbService.getByFields<NBReferral>(this.tableName, {
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
        this.tableName,
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
   * @returns Whether or not the user has reachhed the referral threshold.
   */
  public async reachedReferralThreshold(userID: string): Promise<boolean> {
    const referralThresholdResource = await this.resourceService.getResource(
      'REFERRAL_THRESHOLD',
    );
    const referralThreshold = parseInt(referralThresholdResource);

    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const referrals = await this.getReferrals(userID);

      return referrals.length >= referralThreshold;
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Delete a referral record.
   *
   * @param userID The user's ID.
   * @param newUserID The new user's ID.
   */
  public async deleteReferral(
    userID: string,
    newUserID: string,
  ): Promise<void> {
    await this.dbService.deleteByFields(this.tableName, { userID, newUserID });
  }

  /**
   * Delete all referral records associated with a user.
   *
   * @param userID The user's ID.
   */
  public async deleteUserReferrals(userID: string): Promise<void> {
    await this.dbService.deleteByFields(this.tableName, { userID });
  }
}