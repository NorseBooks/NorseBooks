import { Component, OnInit } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { MessageService } from '../../services/message/message.service';
import { UserInfo } from '../../services/user/user.interface';
import { NBMessage } from '../../services/message/message.interface';

/**
 * The global site header.
 */
@Component({
  selector: 'nb-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public loggedIn = false;
  public admin = false;
  public thisUser!: UserInfo;
  public unreadMessages: NBMessage[] = [];
  public loginLogoutAfter = window.location.pathname || '/';

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loggedIn = this.userService.loggedIn();
    this.userService.loggedInChange.subscribe(async (loggedIn) => {
      this.loggedIn = loggedIn;

      if (this.loggedIn) {
        const userInfo = await this.userService.getUserInfo();
        this.admin = userInfo.admin;
      } else {
        this.admin = false;
      }
    });

    if (this.loggedIn) {
      this.thisUser = await this.userService.getUserInfo();
      this.admin = this.thisUser.admin;

      const threads = await this.messageService.getMessageThreads();
      this.unreadMessages = threads.filter(
        (message) => !message.read && message.fromUserID !== this.thisUser.id,
      );
    }

    this.messageService.threadsChange.subscribe(async (threads) => {
      this.unreadMessages = threads.filter(
        (message) => !message.read && message.fromUserID !== this.thisUser.id,
      );
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof RoutesRecognized),
        pairwise(),
      )
      .subscribe((events) => {
        this.loginLogoutAfter = (events[1] as any)?.urlAfterRedirects || '/';
      });
  }
}
