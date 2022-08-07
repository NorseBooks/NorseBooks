import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBFeedback } from './feedback.interface';

/**
 * Feedback service.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Send feedback to the admins.
   *
   * @param feedback The feedback.
   * @returns The new feedback record.
   */
  public async sendFeedback(feedback: string): Promise<NBFeedback> {
    return this.apiService.post<NBFeedback>('feedback', {
      query: { feedback },
    });
  }

  /**
   * Get a feedback record.
   *
   * @param feedbackID The feedback ID.
   * @returns The feedback record.
   */
  public async getFeedback(feedbackID: string): Promise<NBFeedback> {
    return this.apiService.get<NBFeedback>('feedback', {
      query: { feedbackID },
    });
  }

  /**
   * Get the user's feedback.
   *
   * @returns The user feedback.
   */
  public async getUserFeedback(): Promise<NBFeedback | undefined> {
    return this.apiService.get<NBFeedback | undefined>(
      'feedback/user-feedback',
    );
  }

  /**
   * Get all user feedback.
   *
   * @returns All user feedback.
   */
  public async getAllFeedback(): Promise<NBFeedback[]> {
    return this.apiService.get<NBFeedback[]>('feedback/all');
  }

  /**
   * Delete a feedback record.
   *
   * @param feedbackID The feedback ID.
   */
  public async deleteFeedback(feedbackID: string): Promise<void> {
    await this.apiService.delete('feedback', { query: { feedbackID } });
  }
}
