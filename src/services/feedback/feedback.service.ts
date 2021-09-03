import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { NBFeedback } from './feedback.interface';
import { ServiceException } from '../service.exception';

/**
 * Feedback table name.
 */
export const feedbackTableName = 'NB_FEEDBACK';

/**
 * Feedback table service.
 */
@Injectable()
export class FeedbackService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Send feedback on the application.
   *
   * @param userID The user's ID.
   * @param feedback The feedback.
   * @returns The new feedback record.
   */
  public async sendFeedback(
    userID: string,
    feedback: string,
  ): Promise<NBFeedback> {
    const feedbackMaxLength = await this.resourceService.getResource<number>(
      'FEEDBACK_MAX_LENGTH',
    );

    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const userFeedback = await this.getUserFeedback(userID);

      if (userFeedback === undefined) {
        if (feedback.length >= 1 && feedback.length <= feedbackMaxLength) {
          return this.dbService.create<NBFeedback>(feedbackTableName, {
            userID,
            feedback,
          });
        } else {
          throw new ServiceException(
            `Feedback must be between 1 and ${feedbackMaxLength} characters`,
          );
        }
      } else {
        throw new ServiceException('User has already provided feedback');
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a feedback record exists.
   *
   * @param feedbackID The feedback ID.
   * @returns Whether or not the feedback record exists.
   */
  public async feedbackExists(feedbackID: string): Promise<boolean> {
    const feedback = await this.dbService.getByID<NBFeedback>(
      feedbackTableName,
      feedbackID,
    );
    return !!feedback;
  }

  /**
   * Get a feedback record.
   *
   * @param feedbackID The feedback ID.
   * @returns The feedback record.
   */
  public async getFeedback(feedbackID: string): Promise<NBFeedback> {
    const feedback = await this.dbService.getByID<NBFeedback>(
      feedbackTableName,
      feedbackID,
    );

    if (feedback) {
      return feedback;
    } else {
      throw new ServiceException('Feedback does not exist');
    }
  }

  /**
   * Get feedback provided by a user.
   *
   * @param userID The user's ID.
   * @returns The feedback provided by the user, or undefined if no feedback provided.
   */
  public async getUserFeedback(
    userID: string,
  ): Promise<NBFeedback | undefined> {
    return this.dbService.getByFields<NBFeedback>(feedbackTableName, {
      userID,
    });
  }

  /**
   * Get all user feedback.
   *
   * @returns All user feedback.
   */
  public async getAllFeedback(): Promise<NBFeedback[]> {
    return this.dbService.list<NBFeedback>(feedbackTableName, {
      fieldName: 'submitTime',
      sortOrder: 'ASC',
    });
  }

  /**
   * Delete a feedback record.
   *
   * @param feedbackID The feedback ID.
   */
  public async deleteFeedback(feedbackID: string): Promise<void> {
    await this.dbService.deleteByID(feedbackTableName, feedbackID);
  }
}
