import { Component, Input } from '@angular/core';

/**
 * The forbidden page.
 */
@Component({
  selector: 'nb-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss'],
})
export class ForbiddenComponent {
  @Input() forbiddenAction = 'view this page';
}
