import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { MessageService } from '../../services/message/message.service';
import { OtherUserInfo } from '../../services/user/user.interface';
import { NBMessage } from '../../services/message/message.interface';
import { inputAppearance } from '../../globals';

/**
 * The page to view and send messages to another user.
 */
@Component({
  selector: 'nb-message-user',
  templateUrl: './message-user.component.html',
  styleUrls: ['./message-user.component.scss'],
})
export class MessageUserComponent implements OnInit {
  public messageContentMaxLength = 1;
  public done = false;
  public otherUserID = '';
  public otherUser!: OtherUserInfo;
  public messages: NBMessage[] = [];
  public messageContent = '';
  public submittingSendMessage = false;
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.messageContentMaxLength = await this.resourceService.get(
      'MESSAGE_CONTENT_MAX_LENGTH',
    );

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.otherUserID = paramMap.get('userID') || '';

      this.otherUser = await this.userService.getOtherUserInfo(
        this.otherUserID,
      );

      await this.updateMessages();

      this.messageService.threadsChange.subscribe(async () => {
        await this.updateMessages();
      });

      await this.messageService.updateThreads();

      this.done = true;
    });
  }

  /**
   * Update the message history.
   */
  public async updateMessages(): Promise<void> {
    this.messages = await this.messageService.getMessageHistory(
      this.otherUserID,
    );

    await this.markThreadRead();
  }

  /**
   * Mark the thread as read.
   */
  public async markThreadRead(): Promise<void> {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage.fromUserID === this.otherUserID && !lastMessage.read) {
      await this.messageService.markRead(lastMessage.id);
    }
  }

  /**
   * Send a message.
   *
   * @param form The send message form.
   */
  public async onSendMessage(): Promise<void> {
    if (this.messageContent.length > 0) {
      this.submittingSendMessage = true;

      try {
        const content = this.messageContent;
        this.messageContent = '';

        await this.messageService.sendMessage(this.otherUserID, content);
        await this.updateMessages();
      } catch (err: any) {
        this.snackBar.open('Failed to send message', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        console.error(err);
      }

      this.submittingSendMessage = false;
    }
  }

  /**
   * Delete a message.
   *
   * @param messageID The message's ID.
   */
  public async onDeleteMessage(messageID: string): Promise<void> {
    try {
      await this.messageService.deleteMessage(messageID);
      await this.updateMessages();
    } catch (err: any) {
      this.snackBar.open('Failed to delete message', undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });

      console.error(err);
    }
  }
}
