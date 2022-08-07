import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { APIService } from '../api/api.service';
import { UserService } from '../user/user.service';
import { ReportService } from '../report/report.service';
import { FeedbackService } from '../feedback/feedback.service';
import { AdminStats, AdminDatabaseUsage, AdminUser } from './admin.interface';
import { NBBook } from '../book/book.interface';

/**
 * Admin service.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly updateAdminNotificationsInterval = 60 * 1000;
  public adminNotificationsChange = new Subject<number>();

  constructor(
    private readonly apiService: APIService,
    private readonly userService: UserService,
    private readonly reportService: ReportService,
    private readonly feedbackService: FeedbackService,
  ) {
    if (this.userService.loggedIn()) {
      this.userService.getUserInfo().then((user) => {
        if (user.admin) {
          this.updateAdminNotifications();
        }
      });
    }

    setInterval(() => {
      if (this.userService.loggedIn()) {
        this.userService.getUserInfo().then((user) => {
          if (user.admin) {
            this.updateAdminNotifications();
          }
        });
      }
    }, this.updateAdminNotificationsInterval);
  }

  /**
   * Get site statistics.
   *
   * @returns Site statistics.
   */
  public async getStats(): Promise<AdminStats> {
    return this.apiService.get<AdminStats>('admin/stats');
  }

  /**
   * Get all users on the site.
   *
   * @returns All users on the site.
   */
  public async getUsers(): Promise<AdminUser[]> {
    return this.apiService.get<AdminUser[]>('admin/users');
  }

  /**
   * Get all books on the site.
   *
   * @returns All books on the site.
   */
  public async getBooks(): Promise<NBBook[]> {
    return this.apiService.get<NBBook[]>('admin/books');
  }

  /**
   * Get the database usage statistics.
   *
   * @returns The database usage statistics.
   */
  public async getDatabaseUsage(): Promise<AdminDatabaseUsage> {
    return this.apiService.get<AdminDatabaseUsage>('admin/database-usage');
  }

  /**
   * Get the user's admin notification count.
   *
   * @returns The number of admin notifications.
   */
  public async getAdminNotifications(): Promise<number> {
    const reports = await this.reportService.getAllReports();
    const feedback = await this.feedbackService.getAllFeedback();
    return reports.length + feedback.length;
  }

  /**
   * Update the user's admin notification count.
   */
  public async updateAdminNotifications(): Promise<void> {
    const count = await this.getAdminNotifications();
    this.adminNotificationsChange.next(count);
  }
}
