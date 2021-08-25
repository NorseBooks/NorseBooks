import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { NBMessage } from './message.interface';
import { ServiceException } from '../service.exception';

/**
 * Message table service.
 */
@Injectable()
export class MessageService {
  private readonly tableName = 'NB_MESSAGE';

  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Send a message.
   *
   * @param fromUserID The ID of the user sending the message.
   * @param toUserID The ID of the user receiving the message.
   * @param content The message content.
   * @returns The new message record.
   */
  public async sendMessage(
    fromUserID: string,
    toUserID: string,
    content: string,
  ): Promise<NBMessage> {
    const messageContentMaxLength =
      await this.resourceService.getResource<number>(
        'MESSAGE_CONTENT_MAX_LENGTH',
      );

    const fromUserExists = await this.userService.userExists(fromUserID);
    const toUserExists = await this.userService.userExists(toUserID);

    if (fromUserExists && toUserExists) {
      if (content.length >= 1 && content.length <= messageContentMaxLength) {
        const message = await this.dbService.create<NBMessage>(this.tableName, {
          fromUserID,
          toUserID,
          content,
        });
        await this.deleteOldMessages(fromUserID, toUserID);
        return message;
      } else {
        throw new ServiceException(
          `Message content must be between 1 and ${messageContentMaxLength} characters`,
        );
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a message exists.
   *
   * @param messageID The message's ID.
   * @returns Whether or not the message exists.
   */
  public async messageExists(messageID: string): Promise<boolean> {
    const message = await this.dbService.getByID<NBMessage>(
      this.tableName,
      messageID,
    );
    return !!message;
  }

  /**
   * Get a message.
   *
   * @param messageID The message's ID.
   * @returns The message record.
   */
  public async getMessage(messageID: string): Promise<NBMessage> {
    const message = await this.dbService.getByID<NBMessage>(
      this.tableName,
      messageID,
    );

    if (message) {
      return message;
    } else {
      throw new ServiceException('Message does not exist');
    }
  }

  /**
   * Get a user's message threads.
   *
   * @param userID The user's ID.
   * @returns
   */
  public async getMessageThreads(userID: string): Promise<NBMessage[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const sql = `
        WITH x AS (
          SELECT
              MAX("sendTime") "sendTime",
              least("fromUserID", "toUserID") "userID1",
              greatest("fromUserID", "toUserID") "userID2"
            FROM "NB_MESSAGE"
            GROUP BY
              least("fromUserID", "toUserID"),
              greatest("fromUserID", "toUserID")
        )
        SELECT "NB_MESSAGE".*
          FROM "NB_MESSAGE"
          JOIN x
            ON "NB_MESSAGE"."sendTime" = x."sendTime"
          WHERE "fromUserID" = ? OR "toUserID" = ?
          ORDER BY "sendTime" DESC;
      `;
      const params = [userID, userID];
      return this.dbService.execute<NBMessage>(sql, params);
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get message history for two users.
   *
   * @param userID1 One user's ID.
   * @param userID2 Another user's ID.
   * @returns Messages exchanged between two users.
   */
  public async getMessages(
    userID1: string,
    userID2: string,
  ): Promise<NBMessage[]> {
    const user1Exists = await this.userService.userExists(userID1);
    const user2Exists = await this.userService.userExists(userID2);

    if (user1Exists && user2Exists) {
      return this.dbService.listCustom<NBMessage>(
        this.tableName,
        '("fromUserID" = ? AND "toUserID" = ?) OR ("fromUserID" = ? AND "toUserID" = ?)',
        { fieldName: 'sendTime', sortOrder: 'ASC' },
        [userID1, userID2, userID2, userID1],
      );
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Mark a message as read.
   *
   * @param messageID The message's ID.
   * @returns The updated message record.
   */
  public async markRead(messageID: string): Promise<NBMessage> {
    const messageExists = await this.messageExists(messageID);

    if (messageExists) {
      return this.dbService.updateByID<NBMessage>(this.tableName, messageID, {
        read: true,
      });
    } else {
      throw new ServiceException('Message does not exist');
    }
  }

  /**
   * Mark a message as unread.
   *
   * @param messageID The message's ID.
   * @returns The updated message record.
   */
  public async markUnread(messageID: string): Promise<NBMessage> {
    const messageExists = await this.messageExists(messageID);

    if (messageExists) {
      return this.dbService.updateByID<NBMessage>(this.tableName, messageID, {
        read: false,
      });
    } else {
      throw new ServiceException('Message does not exist');
    }
  }

  /**
   * Delete a message.
   *
   * @param messageID The message's ID.
   */
  public async deleteMessage(messageID: string): Promise<void> {
    await this.dbService.deleteByID(this.tableName, messageID);
  }

  /**
   * Delete old messages.
   */
  public async deleteOldMessages(
    fromUserID: string,
    toUserID: string,
  ): Promise<void> {
    const maxMessages = await this.resourceService.getResource<number>(
      'MAX_MESSAGES',
    );

    const fromUserExists = await this.userService.userExists(fromUserID);
    const toUserExists = await this.userService.userExists(toUserID);

    if (fromUserExists && toUserExists) {
      const sql = `
        DELETE FROM "${this.tableName}"
          WHERE "fromUserID" = ? AND "toUserID" = ?
          AND "id" NOT IN (
            SELECT "id" FROM "${this.tableName}"
              WHERE "fromUserID" = ? AND "toUserID" = ?
              ORDER BY "sendTime" DESC
              LIMIT ?
          );
      `;
      const params = [fromUserID, toUserID, fromUserID, toUserID, maxMessages];
      await this.dbService.execute(sql, params);
    } else {
      throw new ServiceException('User does not exist');
    }
  }
}
