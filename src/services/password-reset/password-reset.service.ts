import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { NBPasswordReset } from './password-reset.interface';
import { NBUser } from '../user/user.interface';
import { ServiceException } from '../service.exception';

/**
 * Password reset table service.
 */
@Injectable()
export class PasswordResetService {
  private readonly tableName = 'NB_PASSWORD_RESET';

  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Create a password reset record.
   *
   * @param userID The ID of the user requesting the password reset.
   * @returns The new password reset record.
   */
  public async createPasswordReset(userID: string): Promise<NBPasswordReset> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const passwordResetExists = await this.passwordResetExistsByUserID(
        userID,
      );

      if (!passwordResetExists) {
        return this.dbService.create<NBPasswordReset>(this.tableName, {
          userID,
        });
      } else {
        return this.getPasswordResetByUserID(userID);
      }
    }
  }

  /**
   * Determine whether or not a password reset record exists.
   * @param passwordResetID The password reset ID.
   * @returns Whether or not the password reset record exists.
   */
  public async passwordResetExists(passwordResetID: string): Promise<boolean> {
    const passwordReset = await this.dbService.getByID<NBPasswordReset>(
      this.tableName,
      passwordResetID,
    );
    return !!passwordReset;
  }

  /**
   * Determine whether or not a password reset record exists for a given user ID.
   *
   * @param userID The ID of the user associated with the password reset record.
   * @returns Whether or not the password reset record exists for the given user ID.
   */
  public async passwordResetExistsByUserID(userID: string): Promise<boolean> {
    const passwordReset = await this.dbService.getByFields<NBPasswordReset>(
      this.tableName,
      { userID },
    );
    return !!passwordReset;
  }

  /**
   * Get a password reset record.
   *
   * @param passwordResetID The password reset record's ID.
   * @returns The password reset record.
   */
  public async getPasswordReset(
    passwordResetID: string,
  ): Promise<NBPasswordReset> {
    const passwordReset = await this.dbService.getByID<NBPasswordReset>(
      this.tableName,
      passwordResetID,
    );

    if (passwordReset) {
      return passwordReset;
    } else {
      throw new ServiceException('Password reset record does not exist');
    }
  }

  /**
   * Get the password reset record associated with a user.
   *
   * @param userID The ID of thhe user associated with the password reset record.
   * @returns The password reset record associated with the user.
   */
  public async getPasswordResetByUserID(
    userID: string,
  ): Promise<NBPasswordReset> {
    const passwordReset = await this.dbService.getByFields<NBPasswordReset>(
      this.tableName,
      { userID },
    );

    if (passwordReset) {
      return passwordReset;
    } else {
      throw new ServiceException(
        'Password reset record does not exist for given user ID',
      );
    }
  }

  /**
   * Get all password reset records.
   *
   * @returns All password reset records.
   */
  public async getPasswordResets(): Promise<NBPasswordReset[]> {
    return this.dbService.list<NBPasswordReset>(this.tableName, {
      fieldName: 'createTime',
      sortOrder: 'ASC',
    });
  }

  /**
   * Get the user associated with a password reset record.
   *
   * @param passwordResetID The password reset record's ID.
   * @returns The user associated with the password reset record.
   */
  public async getUserByPasswordReset(
    passwordResetID: string,
  ): Promise<NBUser> {
    const sql = `
      SELECT * FROM "NB_USER" WHERE "id" = (
        SELECT "userID" FROM "${this.tableName}" WHERE id = ?
      );`;
    const params = [passwordResetID];
    const res = await this.dbService.execute<NBUser>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceException(
        'User does not exist for given password reset ID',
      );
    }
  }

  /**
   * Delete a password reset record.
   *
   * @param passwordResetID The password reset record's ID.
   */
  public async deletePasswordReset(passwordResetID: string): Promise<void> {
    await this.dbService.deleteByID(this.tableName, passwordResetID);
  }

  /**
   * Reset a user's password and delete the password reset record.
   *
   * @param passwordResetID The password reset record's ID.
   * @param newPassword The user's new password.
   */
  public async resetPassword(
    passwordResetID: string,
    newPassword: string,
  ): Promise<void> {
    const resources = await this.resourceService.getResources();
    const userPasswordMinLength = parseInt(resources.USER_PASSWORD_MIN_LENGTH);
    const userPasswordMaxLength = parseInt(resources.USER_PASSWORD_MAX_LENGTH);

    if (
      newPassword.length >= userPasswordMinLength &&
      newPassword.length <= userPasswordMaxLength
    ) {
      const passwordResetExists = await this.passwordResetExists(
        passwordResetID,
      );

      if (passwordResetExists) {
        const user = await this.getUserByPasswordReset(passwordResetID);
        await this.deletePasswordReset(passwordResetID);
        await this.userService.setPassword(user.id, newPassword);
      } else {
        throw new ServiceException('Invalid password reset ID');
      }
    } else {
      throw new ServiceException(
        `Password must be between ${userPasswordMinLength} and ${userPasswordMaxLength} characters`,
      );
    }
  }

  /**
   * Prune all old password reset records.
   */
  public async prunePasswordResets(): Promise<void> {
    const passwordResetAgeResource = await this.resourceService.getResource(
      'PASSWORD_RESET_AGE',
    );
    const passwordResetAge = parseInt(passwordResetAgeResource);

    const sql = `DELETE FROM "${this.tableName}" WHERE EXTRACT(EPOCH FROM NOW() - "createTime") >= ${passwordResetAge};`;
    await this.dbService.execute(sql);
  }
}
