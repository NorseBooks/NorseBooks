import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * The unauthorized page.
 */
@Component({
  selector: 'nb-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})
export class UnauthorizedComponent implements OnInit {
  @Input() unauthorizedAction = 'view this page';
  @Input() after = '/';

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.queryParamMap.subscribe((queryParamMap) => {
      this.after = queryParamMap.get('after') || this.after;
    });
  }
}
