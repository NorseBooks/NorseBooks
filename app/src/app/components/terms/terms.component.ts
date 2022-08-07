import { Component, OnInit } from '@angular/core';
import { TermsService } from '../../services/terms/terms.service';

/**
 * The terms and conditions page.
 */
@Component({
  selector: 'nb-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit {
  public done = false;
  public terms = '';

  constructor(private readonly termsService: TermsService) {}

  public async ngOnInit(): Promise<void> {
    this.terms = await this.termsService.getTerms();
    this.done = true;
  }
}
