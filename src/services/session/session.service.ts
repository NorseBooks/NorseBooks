import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { NBSession } from './session.interface';
import { NBUser } from '../user/user.interface';
import { ServiceException } from '../service.exception';

/**
 * Session table service.
 */
@Injectable()
export class SessionService {
  private readonly tableName = 'NB_SESSION';

  constructor(
    private readonly dbService: DBService,
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
      const session = await this.dbService.create<NBSession>(this.tableName, {
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
      this.tableName,
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
      this.tableName,
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
      SELECT * FROM "NB_USER" WHERE id = (
        SELECT "userID" FROM "${this.tableName}" WHERE id = ?
      );`;
    const params = [sessionID];
    const res = await this.dbService.execute<NBUser>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceException('User or session does not exist');
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
        this.tableName,
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
    await this.dbService.deleteByID(this.tableName, sessionID);
  }

  /**
   * Delete all sessions associated with a user.
   *
   * @param userID The user's ID.
   */
  public async deleteUserSessions(userID: string): Promise<void> {
    await this.dbService.deleteByFields(this.tableName, { userID });
  }

  /**
   * Delete all old user sessions.
   *
   * @param userID The user's ID.
   */
  public async deleteOldUserSessions(userID: string): Promise<void> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const userMaxSessionsResource = await this.resourceService.getResource(
        'USER_MAX_SESSIONS',
      );
      const userMaxSessions = parseInt(userMaxSessionsResource);

      const sql = `
        DELETE FROM "${this.tableName}"
          WHERE "userID" = ?
          AND "id" NOT IN (
            SELECT "id" FROM "${this.tableName}"
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
