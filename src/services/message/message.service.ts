/**
 * Message service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { BlockService } from '../block/block.service';
import { NBMessage } from './message.interface';
import { ServiceException } from '../service.exception';

/**
 * Message table name.
 */
export const messageTableName = 'NB_MESSAGE';

/**
 * Message table service.
 */
@Injectable()
export class MessageService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => BlockService))
    private readonly blockService: BlockService,
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
      const blocked1 = await this.blockService.isBlocked(fromUserID, toUserID);
      const blocked2 = await this.blockService.isBlocked(toUserID, fromUserID);

      if (!blocked1 && !blocked2) {
        if (content.length >= 1 && content.length <= messageContentMaxLength) {
          const message = await this.dbService.create<NBMessage>(
            messageTableName,
            {
              fromUserID,
              toUserID,
              content,
            },
          );
          await this.deleteOldMessages(fromUserID, toUserID);
          return message;
        } else {
          throw new ServiceException(
            `Message content must be between 1 and ${messageContentMaxLength} characters`,
          );
        }
      } else {
        throw new ServiceException('User is blocked');
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
      messageTableName,
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
      messageTableName,
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
            FROM "${messageTableName}"
            GROUP BY
              least("fromUserID", "toUserID"),
              greatest("fromUserID", "toUserID")
        )
        SELECT "${messageTableName}".*
          FROM "${messageTableName}"
          JOIN x
            ON "${messageTableName}"."sendTime" = x."sendTime"
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
        messageTableName,
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
    const message = await this.getMessage(messageID);

    const sql = `
      WITH updated AS (
        UPDATE "${messageTableName}"
          SET
            "read" = TRUE
          WHERE
            "fromUserID" = ? AND "toUserID" = ? AND EXTRACT(EPOCH FROM "sendTime") <= ?
        RETURNING *
      )
      SELECT *
        FROM updated
        WHERE id = ?;`;
    const params = [
      message.fromUserID,
      message.toUserID,
      message.sendTime / 1000 + 0.000999,
      messageID,
    ];
    const messages = await this.dbService.execute<NBMessage>(sql, params);

    return messages[0];
  }

  /**
   * Mark a message as unread.
   *
   * @param messageID The message's ID.
   * @returns The updated message record.
   */
  public async markUnread(messageID: string): Promise<NBMessage> {
    const message = await this.getMessage(messageID);

    const sql = `
      WITH updated AS (
        UPDATE "${messageTableName}"
          SET
            "read" = FALSE
          WHERE
            "fromUserID" = ? AND "toUserID" = ? AND EXTRACT(EPOCH FROM "sendTime") >= ?
        RETURNING *
      )
      SELECT *
        FROM updated
        WHERE id = ?;`;
    const params = [
      message.fromUserID,
      message.toUserID,
      message.sendTime / 1000,
      messageID,
    ];
    const messages = await this.dbService.execute<NBMessage>(sql, params);

    return messages[0];
  }

  /**
   * Delete a message.
   *
   * @param messageID The message's ID.
   */
  public async deleteMessage(messageID: string): Promise<void> {
    await this.dbService.deleteByID(messageTableName, messageID);
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
        DELETE FROM "${messageTableName}"
          WHERE "fromUserID" = ? AND "toUserID" = ?
          AND "id" NOT IN (
            SELECT "id" FROM "${messageTableName}"
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
