import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { ReportService } from '../../services/report/report.service';
import { NBBook } from '../../services/book/book.interface';
import { inputAppearance } from '../../globals';

/**
 * The user profile page.
 */
@Component({
  selector: 'nb-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public passwordMinLength = 1;
  public passwordMaxLength = 1;
  public done = false;
  public loggedIn = false;
  public userBooks: NBBook[] = [];
  public recommended: NBBook[] = [];
  public reported: NBBook[] = [];
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly reportService: ReportService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.passwordMinLength = await this.resourceService.get(
      'USER_PASSWORD_MIN_LENGTH',
    );
    this.passwordMaxLength = await this.resourceService.get(
      'USER_PASSWORD_MAX_LENGTH',
    );
    this.loggedIn = this.userService.loggedIn();

    if (this.loggedIn) {
      try {
        this.userBooks = await this.userService.getCurrentBooks();
        this.recommended = await this.userService.getRecommendations();
        this.reported = await this.reportService.getUserReportedBooks();
      } catch (err) {
        await this.userService.logout();
        this.loggedIn = false;
      }
    }

    this.done = true;
  }
}
