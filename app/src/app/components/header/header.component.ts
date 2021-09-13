import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';

/**
 * The header component.
 */
@Component({
  selector: 'nb-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public loggedIn = false;

  constructor(private readonly userService: UserService) {}

  public ngOnInit(): void {
    this.loggedIn = this.userService.loggedIn();
    this.userService.loggedInChange.subscribe(
      (loggedIn) => (this.loggedIn = loggedIn),
    );
  }
}
