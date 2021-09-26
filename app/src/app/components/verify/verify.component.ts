import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VerifyService } from '../../services/verify/verify.service';

/**
 * The verification page.
 */
@Component({
  selector: 'nb-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
  public verifyID = '';
  public done = false;
  public verificationError = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly verifyService: VerifyService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.verifyID = paramMap.get('verifyID') || '';

      try {
        await this.verifyService.verify(this.verifyID);
      } catch (err: any) {
        this.verificationError = err;
      }

      this.done = true;
    });
  }
}
