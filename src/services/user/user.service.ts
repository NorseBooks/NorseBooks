import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { ImageService } from '../image/image.service';
import { SessionService } from '../session/session.service';
import { bookTableName } from '../book/book.service';
import { userInterestTableName } from '../user-interest/user-interest.service';
import { NBUser } from './user.interface';
import { NBSession } from '../session/session.interface';
import { NBBook } from '../book/book.interface';
import { ServiceException } from '../service.exception';
import * as bcrypt from 'bcrypt';

/**
 * User table name.
 */
export const userTableName = 'NB_USER';

/**
 * User table service.
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => ImageService))
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
    const userEmailMinLength = await this.resourceService.getResource<number>(
      'USER_EMAIL_MIN_LENGTH',
    );
    const userEmailMaxLength = await this.resourceService.getResource<number>(
      'USER_EMAIL_MAX_LENGTH',
    );
    const userPasswordMinLength =
      await this.resourceService.getResource<number>(
        'USER_PASSWORD_MIN_LENGTH',
      );
    const userPasswordMaxLength =
      await this.resourceService.getResource<number>(
        'USER_PASSWORD_MAX_LENGTH',
      );

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

          return this.dbService.create<NBUser>(userTableName, {
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
    const user = await this.dbService.getByID<NBUser>(userTableName, userID);
    return !!user;
  }

  /**
   * Determine whether or not a user with a given email address exists.
   * @param email The user's email.
   * @returns Whether or not a user with the given email address exists.
   */
  public async userExistsByEmail(email: string): Promise<boolean> {
    const user = await this.dbService.getByFields<NBUser>(userTableName, {
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
    const user = await this.dbService.getByID<NBUser>(userTableName, userID);

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
    const user = await this.dbService.getByFields<NBUser>(userTableName, {
      email,
    });

    if (user) {
      return user;
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get the books currently listed by a user.
   *
   * @param userID The user's ID.
   * @returns All books currently listed by the user.
   */
  public async getCurrentBooks(userID: string): Promise<NBBook[]> {
    const userExists = await this.userExists(userID);

    if (userExists) {
      return this.dbService.listByFields<NBBook>(
        bookTableName,
        { userID },
        { fieldName: 'listTime', sortOrder: 'ASC' },
      );
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
    const userPasswordMinLength =
      await this.resourceService.getResource<number>(
        'USER_PASSWORD_MIN_LENGTH',
      );
    const userPasswordMaxLength =
      await this.resourceService.getResource<number>(
        'USER_PASSWORD_MAX_LENGTH',
      );

    if (
      newPassword.length >= userPasswordMinLength &&
      newPassword.length <= userPasswordMaxLength
    ) {
      const userExists = await this.userExists(userID);

      if (userExists) {
        const passwordHash = await this.hashPassword(newPassword);

        return this.dbService.updateByID<NBUser>(userTableName, userID, {
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
      return this.dbService.updateByID<NBUser>(userTableName, userID, {
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

      return this.dbService.updateByID<NBUser>(userTableName, userID, {
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

      return this.dbService.updateByID<NBUser>(userTableName, userID, {
        imageID: null,
      });
    } else {
      return user;
    }
  }

  /**
   * Increment the number of books a user has listed.
   *
   * @param userID The user's ID.
   * @param num The number to increment by.
   * @returns The updated user record.
   */
  public async incrementBooksListed(userID: string, num = 1): Promise<NBUser> {
    const user = await this.getUser(userID);

    return this.dbService.updateByID<NBUser>(userTableName, userID, {
      numBooksListed: user.numBooksListed + num,
    });
  }

  /**
   * Increment the number of books a user has sold.
   *
   * @param userID The user's ID.
   * @param num The number to increment by.
   * @returns The updated user record.
   */
  public async incrementBooksSold(userID: string, num = 1): Promise<NBUser> {
    const user = await this.getUser(userID);

    return this.dbService.updateByID<NBUser>(userTableName, userID, {
      numBooksSold: user.numBooksSold + num,
    });
  }

  /**
   * Increment the amount of money a user has made.
   *
   * @param userID The user's ID.
   * @param amount The amount of money to add.
   * @returns The updated user record.
   */
  public async addMoneyMade(userID: string, amount: number): Promise<NBUser> {
    const user = await this.getUser(userID);

    return this.dbService.updateByID<NBUser>(userTableName, userID, {
      moneyMade: user.moneyMade + amount,
    });
  }

  /**
   * Get a list of books recommended to the user.
   *
   * @param userID The user's ID.
   * @returns The list of recommended books.
   */
  public async recommendations(userID: string): Promise<NBBook[]> {
    const sql = `
      (
        SELECT "${bookTableName}".*
          FROM "${bookTableName}"
          JOIN "${userInterestTableName}"
            ON "${bookTableName}"."departmentID" = "${userInterestTableName}"."departmentID"
        WHERE "${userInterestTableName}"."userID" = ?
          AND "${bookTableName}"."userID" != ?
      ) UNION (
        SELECT "${bookTableName}".*
          FROM "${bookTableName}"
          JOIN (
            SELECT *
              FROM "${bookTableName}"
              WHERE "userID" = ?
          ) AS "USER_BOOKS"
            ON "${bookTableName}"."departmentID" = "USER_BOOKS"."departmentID"
        WHERE "${bookTableName}"."userID" != ?
      ) ORDER BY "listTime" ASC;`;
    const params = [userID, userID, userID, userID];
    return this.dbService.execute<NBBook>(sql, params);
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
        const sql = `UPDATE "${userTableName}" SET "lastLoginTime" = NOW() WHERE id = ?;`;
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
    await this.dbService.deleteByID(userTableName, userID);
  }

  /**
   * Prune all old unverified accounts.
   */
  public async pruneUnverifiedUsers(): Promise<void> {
    const unverifiedUserAge = await this.resourceService.getResource<number>(
      'UNVERIFIED_USER_AGE',
    );

    const sql = `DELETE FROM "${userTableName}" WHERE "verified" = FALSE AND EXTRACT(EPOCH FROM NOW() - "joinTime") >= ${unverifiedUserAge};`;
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
    const saltRounds = await this.resourceService.getResource<number>(
      'SALT_ROUNDS',
    );

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
