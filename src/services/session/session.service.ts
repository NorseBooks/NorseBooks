/**
 * Session service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService, userTableName } from '../user/user.service';
import { NBSession } from './session.interface';
import { NBUser } from '../user/user.interface';
import { ServiceException } from '../service.exception';

/**
 * Session table name.
 */
export const sessionTableName = 'NB_SESSION';

/**
 * Session table service.
 */
@Injectable()
export class SessionService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Create a user session.
   *
   * @param userID The ID of the user creating the session.
   * @returns The new session record.
   */
  public async createSession(userID: string): Promise<NBSession> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const session = await this.dbService.create<NBSession>(sessionTableName, {
        userID,
      });
      await this.deleteOldUserSessions(userID);
      return session;
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a session exists.
   *
   * @param sessionID The session's ID.
   * @returns Whether or not the session exists.
   */
  public async sessionExists(sessionID: string): Promise<boolean> {
    const session = await this.dbService.getByID<NBSession>(
      sessionTableName,
      sessionID,
    );
    return !!session;
  }

  /**
   * Get a user session record.
   *
   * @param sessionID The session's ID.
   * @returns The user session record.
   */
  public async getSession(sessionID: string): Promise<NBSession> {
    const res = await this.dbService.getByID<NBSession>(
      sessionTableName,
      sessionID,
    );

    if (res) {
      return res;
    } else {
      throw new ServiceException('Session does not exist');
    }
  }

  /**
   * Get the user associated with a session.
   *
   * @param sessionID The session's ID.
   * @returns The user associated with the session.
   */
  public async getUserBySessionID(sessionID: string): Promise<NBUser> {
    const sql = `
      SELECT * FROM "${userTableName}" WHERE id = (
        SELECT "userID" FROM "${sessionTableName}" WHERE id = ?
      );`;
    const params = [sessionID];
    const res = await this.dbService.execute<NBUser>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceException('Session does not exist');
    }
  }

  /**
   * Get all sessions associated with a user.
   *
   * @param userID The user's ID.
   * @returns All sessions associated with the user.
   */
  public async getUserSessions(userID: string): Promise<NBSession[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      return this.dbService.listByFields<NBSession>(
        sessionTableName,
        { userID },
        { fieldName: 'createTime', sortOrder: 'ASC' },
      );
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Delete a user session.
   *
   * @param sessionID The session's ID.
   */
  public async deleteSession(sessionID: string): Promise<void> {
    await this.dbService.deleteByID(sessionTableName, sessionID);
  }

  /**
   * Delete all sessions associated with a user.
   *
   * @param userID The user's ID.
   */
  public async deleteUserSessions(userID: string): Promise<void> {
    await this.dbService.deleteByFields(sessionTableName, { userID });
  }

  /**
   * Delete all old user sessions.
   *
   * @param userID The user's ID.
   */
  public async deleteOldUserSessions(userID: string): Promise<void> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const userMaxSessions = await this.resourceService.getResource<number>(
        'USER_MAX_SESSIONS',
      );

      const sql = `
        DELETE FROM "${sessionTableName}"
          WHERE "userID" = ?
          AND "id" NOT IN (
            SELECT "id" FROM "${sessionTableName}"
              WHERE "userID" = ?
              ORDER BY "createTime" DESC
              LIMIT ?
        );
      `;
      const params = [userID, userID, userMaxSessions];
      await this.dbService.execute(sql, params);
    } else {
      throw new ServiceException('User does not exist');
    }
  }
}
