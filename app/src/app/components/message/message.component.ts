import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { MessageService } from '../../services/message/message.service';
import { OtherUserInfo } from '../../services/user/user.interface';
import { NBMessage } from '../../services/message/message.interface';

/**
 * The page to view message threads.
 */
@Component({
  selector: 'nb-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  public done = false;
  public threads: NBMessage[] = [];
  public threadUsers: OtherUserInfo[] = [];
  public readThreads: NBMessage[] = [];
  public readThreadUsers: OtherUserInfo[] = [];
  public unreadThreads: NBMessage[] = [];
  public unreadThreadUsers: OtherUserInfo[] = [];

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  public async ngOnInit(): Promise<void> {
    if (!this.userService.loggedIn()) {
      await this.router.navigate(['unauthorized'], {
        queryParams: { after: 'message' },
      });
    }

    const thisUser = await this.userService.getUserInfo();
    this.threads = await this.messageService.getMessageThreads();
    this.threadUsers = await Promise.all(
      this.threads.map((message) =>
        this.userService.getOtherUserInfo(
          message.fromUserID === thisUser.id
            ? message.toUserID
            : message.fromUserID,
        ),
      ),
    );

    for (let i = 0; i < this.threads.length; i++) {
      if (this.threads[i].read) {
        this.readThreads.push(this.threads[i]);
        this.readThreadUsers.push(this.threadUsers[i]);
      } else {
        this.unreadThreads.push(this.threads[i]);
        this.unreadThreadUsers.push(this.threadUsers[i]);
      }
    }

    this.done = true;
  }
}
