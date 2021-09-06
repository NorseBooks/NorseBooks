import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBMessage } from './message.interface';

/**
 * Message service.
 */
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Send a message to another user.
   *
   * @param userID The ID of the user to send the message to.
   * @param content The message content.
   * @returns The new message.
   */
  public async sendMessage(
    userID: string,
    content: string,
  ): Promise<NBMessage> {
    return this.apiService.post<NBMessage>('message', {
      query: { userID, content },
    });
  }

  /**
   * Get a message.
   *
   * @param messageID The message ID.
   * @returns The message.
   */
  public async getMessage(messageID: string): Promise<NBMessage> {
    return this.apiService.get<NBMessage>('message', { query: { messageID } });
  }

  /**
   * Get the user's message threads.
   *
   * @returns The user's message threads.
   */
  public async getMessageThreads(): Promise<NBMessage[]> {
    return this.apiService.get<NBMessage[]>('message/threads');
  }

  /**
   * Get message history with another user.
   *
   * @param userID The user's ID.
   * @returns The message history with the other user.
   */
  public async getMessageHistory(userID: string): Promise<NBMessage[]> {
    return this.apiService.get<NBMessage[]>('message/history', {
      query: { userID },
    });
  }

  /**
   * Mark a message as read.
   *
   * @param messageID The message ID.
   */
  public async markRead(messageID: string): Promise<void> {
    await this.apiService.patch('message/read', { query: { messageID } });
  }

  /**
   * Delete a message.
   *
   * @param messageID The message ID.
   */
  public async deleteMessage(messageID: string): Promise<void> {
    await this.apiService.delete('message', { query: { messageID } });
  }
}
