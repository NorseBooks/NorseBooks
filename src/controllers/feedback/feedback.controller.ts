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
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Feedback controller.
 */
@Controller('api/feedback')
@UseInterceptors(new ResponseInterceptor())
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

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
  ) {
    return this.feedbackService.sendFeedback(user.id, feedback);
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
  ) {
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
  public async getUserFeedback(@UserSession() user: NBUser) {
    return this.feedbackService.getUserFeedback(user.id);
  }

  /**
   * Get all user feedback.
   *
   * @returns All user feedback.
   */
  @Get('all')
  @UseGuards(AdminGuard)
  public async getAllFeedback() {
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
  ) {
    const feedback = await this.feedbackService.getFeedback(feedbackID);

    if (feedback.userID === user.id || user.admin) {
      await this.feedbackService.deleteFeedback(feedbackID);
    } else {
      throw new ForbiddenException();
    }
  }
}
