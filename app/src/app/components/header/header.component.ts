import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';

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

  constructor(private readonly userService: UserService) {}

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
      const userInfo = await this.userService.getUserInfo();
      this.admin = userInfo.admin;
    }
  }
}
