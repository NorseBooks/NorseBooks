import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { inputAppearance } from '../../globals';

/**
 * The send feedback form.
 */
interface SendFeedbackForm {
  feedback: string;
}

/**
 * The page for providing feedback.
 */
@Component({
  selector: 'nb-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  public feedbackMaxLength = 1;
  public done = false;
  public canProvideFeedback = false;
  public submittingSendFeedback = false;
  public sendFeedbackError = '';
  public sentFeedback = false;
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly router: Router,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly feedbackService: FeedbackService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.feedbackMaxLength = await this.resourceService.get(
      'FEEDBACK_MAX_LENGTH',
    );

    const loggedIn = this.userService.loggedIn();

    if (!loggedIn) {
      await this.router.navigate(['unauthorized'], {
        queryParams: { after: 'feedback' },
      });
    }

    const feedback = await this.feedbackService.getUserFeedback();
    this.canProvideFeedback = feedback === undefined;

    this.done = true;
  }

  /**
   * Send feedback.
   *
   * @param form The send feedback form.
   */
  public async sendFeedback(form: SendFeedbackForm): Promise<void> {
    this.sendFeedbackError = '';
    this.submittingSendFeedback = true;

    try {
      this.feedbackService.sendFeedback(form.feedback);
      this.sentFeedback = true;
    } catch (err: any) {
      this.sendFeedbackError = err;
    }

    this.submittingSendFeedback = false;
  }
}
