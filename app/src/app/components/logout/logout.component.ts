import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'nb-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  public after = '';
  public logoutError = '';

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.queryParamMap.subscribe(async (queryParams) => {
      this.after = queryParams.get('after') || '';

      try {
        await this.userService.logout();
        await this.router.navigate([this.after || '/']);
      } catch (err: any) {
        this.logoutError = err;
      }
    });
  }
}
