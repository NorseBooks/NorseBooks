/**
 * Verify service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService, userTableName } from '../user/user.service';
import { NBVerify } from './verify.interface';
import { NBUser } from '../user/user.interface';
import { ServiceException } from '../service.exception';

/**
 * Verify table name.
 */
export const verifyTableName = 'NB_VERIFY';

/**
 * Verify table service.
 */
@Injectable()
export class VerifyService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Create a verification record.
   *
   * @param userID The ID of the user being verified.
   * @returns The new verification record.
   */
  public async createVerification(userID: string): Promise<NBVerify> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const verificationExists = await this.verificationExistsByUserID(userID);

      if (!verificationExists) {
        return this.dbService.create<NBVerify>(verifyTableName, { userID });
      } else {
        return this.getVerificationByUserID(userID);
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a verification record exists.
   *
   * @param verifyID The verification ID.
   * @returns Whether or not the verification record exists.
   */
  public async verificationExists(verifyID: string): Promise<boolean> {
    const verification = await this.dbService.getByID<NBVerify>(
      verifyTableName,
      verifyID,
    );
    return !!verification;
  }

  /**
   * Determine whether or not a verification record exists for a given user ID.
   *
   * @param userID The ID of the user associated with the verification record.
   * @returns Whether or not the verification record exists for the given user ID.
   */
  public async verificationExistsByUserID(userID: string): Promise<boolean> {
    const verification = await this.dbService.getByFields<NBVerify>(
      verifyTableName,
      { userID },
    );
    return !!verification;
  }

  /**
   * Get a verification record.
   *
   * @param verifyID The verification record's ID.
   * @returns The verification record.
   */
  public async getVerification(verifyID: string): Promise<NBVerify> {
    const verification = await this.dbService.getByID<NBVerify>(
      verifyTableName,
      verifyID,
    );

    if (verification) {
      return verification;
    } else {
      throw new ServiceException('Verification record does not exist');
    }
  }

  /**
   * Get the verification record associated with a user.
   *
   * @param userID The ID of the user associated with the verification record.
   * @returns The verification record associated with the user.
   */
  public async getVerificationByUserID(userID: string): Promise<NBVerify> {
    const verification = await this.dbService.getByFields<NBVerify>(
      verifyTableName,
      { userID },
    );

    if (verification) {
      return verification;
    } else {
      throw new ServiceException(
        'Verification record does not exist for given user ID',
      );
    }
  }

  /**
   * Get all verification records.
   *
   * @returns All verification records.
   */
  public async getVerifications(): Promise<NBVerify[]> {
    return this.dbService.list<NBVerify>(verifyTableName, {
      fieldName: 'createTime',
      sortOrder: 'ASC',
    });
  }

  /**
   * Get the user associated with a verification record.
   *
   * @param verifyID The verification record's ID.
   * @returns The user associated with the verification record.
   */
  public async getUserByVerification(verifyID: string): Promise<NBUser> {
    const sql = `
      SELECT * FROM "${userTableName}" WHERE "id" = (
        SELECT "userID" FROM "${verifyTableName}" WHERE "id" = ?
      );`;
    const params = [verifyID];
    const res = await this.dbService.execute<NBUser>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceException('User does not exist for given verify ID');
    }
  }

  /**
   * Delete a verification record.
   *
   * @param verifyID The verification record's ID.
   */
  public async deleteVerification(verifyID: string): Promise<void> {
    await this.dbService.deleteByID(verifyTableName, verifyID);
  }

  /**
   * Delete a verification record and the corresponding user.
   *
   * @param verifyID The verification record's ID.
   */
  public async deleteUnverifiedUser(verifyID: string): Promise<void> {
    const verificationExists = await this.verificationExists(verifyID);

    if (verificationExists) {
      const verification = await this.getVerification(verifyID);
      const userExists = await this.userService.userExists(verification.userID);

      if (userExists) {
        const user = await this.getUserByVerification(verifyID);

        if (!user.verified) {
          await this.userService.deleteUser(user.id);
        }
      }

      await this.deleteVerification(verifyID);
    }
  }

  /**
   * Verify a user's account and delete the verification record.
   *
   * @param verifyID The verification record's ID.
   */
  public async verifyUser(verifyID: string): Promise<void> {
    const verificationExists = await this.verificationExists(verifyID);

    if (verificationExists) {
      const user = await this.getUserByVerification(verifyID);
      await this.deleteVerification(verifyID);
      await this.userService.setVerified(user.id);
    } else {
      throw new ServiceException('Invalid verify ID');
    }
  }

  /**
   * Prune all old verification records.
   */
  public async pruneVerifications(): Promise<void> {
    const verificationAge = await this.resourceService.getResource<number>(
      'VERIFICATION_AGE',
    );

    const sql = `DELETE FROM "${verifyTableName}" WHERE EXTRACT(EPOCH FROM NOW() - "createTime") >= ${verificationAge};`;
    await this.dbService.execute(sql);
  }
}
