import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { ImageService } from '../image/image.service';
import { SessionService } from '../session/session.service';
import { NBUser } from './user.interface';
import { NBSession } from '../session/session.interface';
import { ServiceException } from '../service.exception';
import * as bcrypt from 'bcrypt';

/**
 * User table service.
 */
@Injectable()
export class UserService {
  private readonly tableName = 'NB_USER';

  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    private readonly resourceService: ResourceService,
    private readonly imageService: ImageService,
    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Create a new user.
   *
   * @param firstname The user's first name.
   * @param lastname The user's last name.
   * @param email The user's email address.
   * @param password The user's password.
   * @returns The new user record.
   */
  public async createUser(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
  ): Promise<NBUser> {
    const resources = await this.resourceService.getResources();
    const userEmailMinLength = parseInt(resources.USER_EMAIL_MIN_LENGTH);
    const userEmailMaxLength = parseInt(resources.USER_EMAIL_MAX_LENGTH);
    const userPasswordMinLength = parseInt(resources.USER_PASSWORD_MIN_LENGTH);
    const userPasswordMaxLength = parseInt(resources.USER_PASSWORD_MAX_LENGTH);

    if (
      email.length >= userEmailMinLength &&
      email.length <= userEmailMaxLength
    ) {
      if (
        password.length >= userPasswordMinLength &&
        password.length <= userPasswordMaxLength
      ) {
        const emailExists = await this.userExistsByEmail(email);

        if (!emailExists) {
          const passwordHash = await this.hashPassword(password);

          return this.dbService.create<NBUser>(this.tableName, {
            firstname,
            lastname,
            email,
            passwordHash,
          });
        } else {
          throw new ServiceException('Email is already in use');
        }
      } else {
        throw new ServiceException(
          `Password must be between ${userPasswordMinLength} and ${userPasswordMaxLength} characters`,
        );
      }
    } else {
      throw new ServiceException(
        `Email must be between ${userEmailMinLength} and ${userEmailMaxLength} characters`,
      );
    }
  }

  /**
   * Determine whether or not a user exists.
   *
   * @param userID The ID of the user.
   * @returns Whether or not the user exists.
   */
  public async userExists(userID: string): Promise<boolean> {
    const user = await this.dbService.getByID<NBUser>(this.tableName, userID);
    return !!user;
  }

  /**
   * Determine whether or not a user with a given email address exists.
   * @param email The user's email.
   * @returns Whether or not a user with the given email address exists.
   */
  public async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.dbService.getByFields<NBUser>(this.tableName, {
      email,
    });
    return !!user;
  }

  /**
   * Get a user.
   *
   * @param userID The user's ID.
   * @returns The user record.
   */
  public async getUser(userID: string): Promise<NBUser> {
    const user = await this.dbService.getByID<NBUser>(this.tableName, userID);

    if (user) {
      return user;
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get a user given an email address.
   *
   * @param email The user's email address.
   * @returns The user record.
   */
  public async getUserByEmail(email: string): Promise<NBUser> {
    const user = await this.dbService.getByFields<NBUser>(this.tableName, {
      email,
    });

    if (user) {
      return user;
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Set a user's password.
   *
   * @param userID The user's ID.
   * @param newPassword The new password.
   * @returns The updated user record.
   */
  public async setPassword(
    userID: string,
    newPassword: string,
  ): Promise<NBUser> {
    const resources = await this.resourceService.getResources();
    const userPasswordMinLength = parseInt(resources.USER_PASSWORD_MIN_LENGTH);
    const userPasswordMaxLength = parseInt(resources.USER_PASSWORD_MAX_LENGTH);

    if (
      newPassword.length >= userPasswordMinLength &&
      newPassword.length <= userPasswordMaxLength
    ) {
      const userExists = await this.userExists(userID);

      if (userExists) {
        const passwordHash = await this.hashPassword(newPassword);

        return this.dbService.updateByID<NBUser>(this.tableName, userID, {
          passwordHash,
        });
      } else {
        throw new ServiceException('User does not exist');
      }
    } else {
      throw new ServiceException(
        `Password must be between ${userPasswordMinLength} and ${userPasswordMaxLength} characters`,
      );
    }
  }

  /**
   * Set a user's verified status.
   *
   * @param userID The user's ID.
   * @param verified The new verified status.
   * @returns The updated user record.
   */
  public async setVerified(userID: string, verified = true): Promise<NBUser> {
    const userExists = await this.userExists(userID);

    if (userExists) {
      return this.dbService.updateByID<NBUser>(this.tableName, userID, {
        verified,
      });
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Set a user's image.
   *
   * @param userID The user's ID.
   * @param imageData The image data.
   * @returns The updated user record.
   */
  public async setUserImage(
    userID: string,
    imageData: string,
  ): Promise<NBUser> {
    const user = await this.getUser(userID);

    if (user.imageID) {
      await this.imageService.setImageData(user.imageID, imageData);

      return user;
    } else {
      const image = await this.imageService.createImage(imageData);

      return this.dbService.updateByID<NBUser>(this.tableName, userID, {
        imageID: image.id,
      });
    }
  }

  /**
   * Delete a user's image.
   *
   * @param userID The user's ID.
   * @returns The updated user record.
   */
  public async deleteUserImage(userID: string): Promise<NBUser> {
    const user = await this.getUser(userID);

    if (user.imageID) {
      await this.imageService.deleteImage(user.imageID);

      return this.dbService.updateByID<NBUser>(this.tableName, userID, {
        imageID: null,
      });
    } else {
      return user;
    }
  }

  /**
   * Log a user in and return the new session.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @returns The new user session.
   */
  public async login(email: string, password: string): Promise<NBSession> {
    const userExists = await this.userExistsByEmail(email);

    if (userExists) {
      const user = await this.getUserByEmail(email);
      const passwordMatch = await this.passwordMatch(
        password,
        user.passwordHash,
      );

      if (passwordMatch) {
        const sql = `UPDATE "${this.tableName}" SET "lastLoginTime" = NOW() WHERE id = ?;`;
        const params = [user.id];
        await this.dbService.execute(sql, params);

        const session = await this.sessionService.createSession(user.id);
        return session;
      } else {
        throw new ServiceException('Invalid login');
      }
    } else {
      throw new ServiceException('Invalid login');
    }
  }

  /**
   * Delete a user.
   *
   * @param userID The user's ID.
   */
  public async deleteUser(userID: string): Promise<void> {
    await this.deleteUserImage(userID);
    await this.dbService.deleteByID(this.tableName, userID);
  }

  /**
   * Prune all old unverified accounts.
   */
  public async pruneUnverifiedUsers(): Promise<void> {
    const unverifiedUserAgeResource = await this.resourceService.getResource(
      'UNVERIFIED_USER_AGE',
    );
    const unverifiedUserAge = parseInt(unverifiedUserAgeResource);

    const sql = `DELETE FROM "${this.tableName}" WHERE "verified" = FALSE AND EXTRACT(EPOCH FROM NOW() - "joinTime") >= ${unverifiedUserAge};`;
    await this.dbService.execute(sql);
  }

  /**
   * Hash a password.
   *
   * @param password The password.
   * @param rounds The number of salt rounds for bcrypt to use.
   * @returns The hashed password.
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRoundsResource = await this.resourceService.getResource(
      'SALT_ROUNDS',
    );
    const saltRounds = parseInt(saltRoundsResource);

    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Check if passwords match.
   *
   * @param password The password.
   * @param hash The hashed password.
   * @returns Whether or not the password and hash match.
   */
  private async passwordMatch(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
