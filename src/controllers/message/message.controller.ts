/**
 * Message controller.
 * @packageDocumentation
 */

import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { MessageService } from '../../services/message/message.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Message controller.
 */
@Controller('api/message')
@UseInterceptors(new ResponseInterceptor())
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Send a message to another user.
   *
   * @param userID The ID of the user to send the message to.
   * @param content The message content.
   * @param user The user.
   * @returns The new message.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async sendMessage(
    @QueryString({ name: 'userID' }) userID: string,
    @QueryString({ name: 'content' }) content: string,
    @UserSession() user: NBUser,
  ) {
    return this.messageService.sendMessage(user.id, userID, content);
  }

  /**
   * Get a message.
   *
   * @param messageID The message ID.
   * @param user The user.
   * @returns The message.
   */
  @Get()
  @UseGuards(SessionRequiredGuard)
  public async getMessage(
    @QueryString({ name: 'messageID' }) messageID: string,
    @UserSession() user: NBUser,
  ) {
    const message = await this.messageService.getMessage(messageID);

    if (message.fromUserID === user.id || message.toUserID === user.id) {
      return message;
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Get the user's message threads.
   *
   * @param user The user.
   * @returns The user's message threads.
   */
  @Get('threads')
  @UseGuards(SessionRequiredGuard)
  public async getMessageThreads(@UserSession() user: NBUser) {
    return this.messageService.getMessageThreads(user.id);
  }

  /**
   * Get message history with another user.
   *
   * @param userID The user's ID.
   * @param user The user.
   * @returns The message history with the other user.
   */
  @Get('history')
  @UseGuards(SessionRequiredGuard)
  public async getMessageHistory(
    @QueryString({ name: 'userID' }) userID: string,
    @UserSession() user: NBUser,
  ) {
    return this.messageService.getMessages(user.id, userID);
  }

  /**
   * Mark a message as read.
   *
   * @param messageID The message ID.
   * @param user The user.
   */
  @Patch('read')
  @UseGuards(SessionRequiredGuard)
  public async markRead(
    @QueryString({ name: 'messageID' }) messageID: string,
    @UserSession() user: NBUser,
  ) {
    const message = await this.messageService.getMessage(messageID);

    if (message.toUserID === user.id) {
      return this.messageService.markRead(messageID);
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Delete a message.
   *
   * @param messageID The message ID.
   * @param user The user.
   */
  @Delete()
  @UseGuards(SessionRequiredGuard)
  public async deleteMessage(
    @QueryString({ name: 'messageID' }) messageID: string,
    @UserSession() user: NBUser,
  ) {
    const message = await this.messageService.getMessage(messageID);

    if (message.fromUserID === user.id) {
      await this.messageService.deleteMessage(messageID);
    } else {
      throw new ForbiddenException();
    }
  }
}
