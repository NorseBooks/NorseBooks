/**
 * Feedback controller.
 * @packageDocumentation
 */

import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { NBFeedback } from '../../services/feedback/feedback.interface';
import { ResourceService } from '../../services/resource/resource.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { Hostname } from 'src/decorators/hostname.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';
import { sendFormattedEmail, emailAddress } from '../../emailer';

/**
 * Feedback controller.
 */
@Controller('api/feedback')
@UseInterceptors(new ResponseInterceptor())
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly resourceService: ResourceService,
  ) {}

  /**
   * Send feedback to the admins.
   *
   * @param feedback The feedback.
   * @param user The user.
   * @returns The new feedback record.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async sendFeedback(
    @QueryString({ name: 'feedback' }) feedback: string,
    @UserSession() user: NBUser,
    @Hostname() hostname: string,
  ): Promise<NBFeedback> {
    const feedbackRecord = await this.feedbackService.sendFeedback(
      user.id,
      feedback,
    );

    const adminEmails = await this.resourceService.getResource<boolean>(
      'ADMIN_EMAILS',
    );

    if (adminEmails) {
      await sendFormattedEmail(
        emailAddress,
        'Admin notification',
        'admin-notification',
        { hostname, notificationType: 'user feedback' },
      );
    }

    return feedbackRecord;
  }

  /**
   * Get a feedback record.
   *
   * @param feedbackID The feedback ID.
   * @param user The user.
   * @returns The feedback.
   */
  @Get()
  @UseGuards(SessionRequiredGuard)
  public async getFeedback(
    @QueryString({ name: 'feedbackID' }) feedbackID: string,
    @UserSession() user: NBUser,
  ): Promise<NBFeedback> {
    const feedback = await this.feedbackService.getFeedback(feedbackID);

    if (feedback.userID === user.id || user.admin) {
      return feedback;
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Get the user's feedback.
   *
   * @param user The user.
   * @returns The user feedback.
   */
  @Get('user-feedback')
  @UseGuards(SessionRequiredGuard)
  public async getUserFeedback(
    @UserSession() user: NBUser,
  ): Promise<NBFeedback | undefined> {
    return this.feedbackService.getUserFeedback(user.id);
  }

  /**
   * Get all user feedback.
   *
   * @returns All user feedback.
   */
  @Get('all')
  @UseGuards(AdminGuard)
  public async getAllFeedback(): Promise<NBFeedback[]> {
    return this.feedbackService.getAllFeedback();
  }

  /**
   * Delete a feedback record.
   *
   * @param feedbackID The feedback ID.
   * @param user The user.
   */
  @Delete()
  @UseGuards(SessionRequiredGuard)
  public async deleteFeedback(
    @QueryString({ name: 'feedbackID' }) feedbackID: string,
    @UserSession() user: NBUser,
  ): Promise<void> {
    const feedback = await this.feedbackService.getFeedback(feedbackID);

    if (feedback.userID === user.id || user.admin) {
      await this.feedbackService.deleteFeedback(feedbackID);
    } else {
      throw new ForbiddenException();
    }
  }
}
