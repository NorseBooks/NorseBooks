import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { MessageService } from '../../services/message/message.service';
import { BlockService } from '../../services/block/block.service';
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
  public otherUserExists = true;
  public otherUserID = '';
  public otherUser!: OtherUserInfo;
  public messages: NBMessage[] = [];
  public isBlocked = false;
  public hasBlocked = false;
  public messageContent = '';
  public submittingSendMessage = false;
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly blockService: BlockService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.messageContentMaxLength = await this.resourceService.get(
      'MESSAGE_CONTENT_MAX_LENGTH',
    );

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.otherUserID = paramMap.get('userID') || '';

      if (!this.userService.loggedIn()) {
        await this.router.navigate(['unauthorized'], {
          queryParams: { after: `message/${this.otherUserID}` },
        });
      }

      try {
        this.otherUser = await this.userService.getOtherUserInfo(
          this.otherUserID,
        );
      } catch (err) {
        this.otherUserExists = false;
        return;
      }

      this.messageService.threadsChange.subscribe(async () => {
        await this.updateMessages();
      });

      await this.messageService.updateThreads();

      await this.updateMessages();

      this.done = true;
    });

    setTimeout(() => {
      const messageArea = document.getElementsByClassName('messages-body')[0];
      messageArea.scrollTo(0, messageArea.scrollHeight);
    }, 500);
  }

  /**
   * Update the message history.
   */
  public async updateMessages(): Promise<void> {
    const messageArea =
      this.messages.length > 0
        ? document.getElementsByClassName('messages-body')[0]
        : undefined;
    const atBottom =
      messageArea !== undefined
        ? messageArea.clientHeight + messageArea.scrollTop >=
          messageArea.scrollHeight
        : undefined;

    this.messages = await this.messageService.getMessageHistory(
      this.otherUserID,
    );

    await this.markThreadRead();

    if (messageArea !== undefined) {
      setTimeout(() => {
        if (atBottom) {
          messageArea.scrollTo(0, messageArea.scrollHeight);
        }
      }, 500);
    }

    this.isBlocked = await this.blockService.isBlocked(this.otherUserID);
    this.hasBlocked = await this.blockService.hasBlocked(this.otherUserID);

    if (this.isBlocked) {
      this.messageContent = 'You have this user blocked';
    } else if (this.hasBlocked) {
      this.messageContent = 'This user has you blocked';
    }
  }

  /**
   * Mark the thread as read.
   */
  public async markThreadRead(): Promise<void> {
    if (this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1];

      if (lastMessage.fromUserID === this.otherUserID && !lastMessage.read) {
        await this.messageService.markRead(lastMessage.id);
      }
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

  /**
   * Block the user.
   */
  public async onBlockUser(): Promise<void> {
    try {
      await this.blockService.blockUser(this.otherUserID);
      await this.updateMessages();
    } catch (err: any) {
      this.snackBar.open('Failed to block user', undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });

      console.error(err);
    }
  }

  /**
   * Unblock the user.
   */
  public async onUnblockUser(): Promise<void> {
    try {
      await this.blockService.unblockUser(this.otherUserID);
      this.messageContent = '';
      await this.updateMessages();
    } catch (err: any) {
      this.snackBar.open('Failed to unblock user', undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });

      console.error(err);
    }
  }
}
