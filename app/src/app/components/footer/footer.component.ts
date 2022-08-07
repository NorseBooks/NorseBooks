import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';

/**
 * The global site footer.
 */
@Component({
  selector: 'nb-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public loggedIn = false;
  public version = '0.0.0';

  constructor(
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loggedIn = this.userService.loggedIn();
    this.userService.loggedInChange.subscribe(
      (loggedIn) => (this.loggedIn = loggedIn),
    );
    this.version = await this.resourceService.get<string>('VERSION');
  }
}
