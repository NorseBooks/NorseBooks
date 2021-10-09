import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { Dialog } from '../dialog/dialog.component';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { BookService } from '../../services/book/book.service';
import { ReportService } from '../../services/report/report.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { AdminService } from '../../services/admin/admin.service';
import { Resources } from '../../services/resource/resource.interface';
import { OtherUserInfo } from '../../services/user/user.interface';
import { NBBook } from '../../services/book/book.interface';
import { NBReport } from '../../services/report/report.interface';
import { NBFeedback } from '../../services/feedback/feedback.interface';
import {
  AdminStats,
  AdminDatabaseUsage,
  AdminUser,
} from '../../services/admin/admin.interface';
import { inputAppearance } from '../../globals';
import { ChartType, ChartOptions } from 'chart.js';
import {
  SingleDataSet,
  Label,
  Color,
  monkeyPatchChartJsLegend,
  monkeyPatchChartJsTooltip,
} from 'ng2-charts';

/**
 * The admin control panel.
 */
@Component({
  selector: 'nb-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  private readonly updateInfoInterval = 60 * 1000;
  public done = false;
  public stats!: AdminStats;
  public dbUsage: AdminDatabaseUsage = {};
  public resources: Resources = {};
  public reports: NBReport[] = [];
  public feedback: NBFeedback[] = [];
  public users: AdminUser[] = [];
  public books: NBBook[] = [];
  public newResources: Resources = {};
  public reportUsers: OtherUserInfo[] = [];
  public reportBooks: NBBook[] = [];
  public feedbackUsers: OtherUserInfo[] = [];
  public sortedUsers: AdminUser[] = [];
  public sortedBooks: NBBook[] = [];
  public deletingReportID = '';
  public settingResource = false;
  public resettingResource = false;
  public deletingReport = false;
  public deletingFeedback = false;
  public chartOptions: ChartOptions = { responsive: true };
  public chartLabels: Label[] = [];
  public chartData: SingleDataSet = [];
  public chartType: ChartType = 'pie';
  public chartLegend = true;
  public chartPlugins = [];
  public chartColors: Color[] = [];
  public readonly inputAppearance = inputAppearance;
  @ViewChild('deleteReportedBookConfirmationDialog')
  deleteReportedBookConfirmationDialog!: Dialog;
  @ViewChild('deleteReportedBookConfirmationTemplate')
  deleteReportedBookConfirmationTemplate!: TemplateRef<any>;

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly reportService: ReportService,
    private readonly feedbackService: FeedbackService,
    private readonly adminService: AdminService,
  ) {}

  public async ngOnInit(): Promise<void> {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();

    const loggedIn = this.userService.loggedIn();

    if (!loggedIn) {
      await this.router.navigate(['unauthorized'], {
        queryParams: { after: 'admin' },
      });
    }

    const thisUser = await this.userService.getUserInfo();

    if (!thisUser.admin) {
      await this.router.navigate(['forbidden']);
    }

    await this.updateInfo();
    setInterval(() => this.updateInfo(), this.updateInfoInterval);
    this.newResources = Object.assign({}, this.resources);
    this.sortedUsers = this.users.slice();
    this.sortedBooks = this.books.slice();

    this.done = true;
  }

  /**
   * Update the viewable info.
   */
  public async updateInfo(): Promise<void> {
    this.stats = await this.adminService.getStats();
    this.dbUsage = await this.adminService.getDatabaseUsage();
    this.resources = await this.resourceService.getAll();
    this.reports = await this.reportService.getAllReports();
    this.feedback = await this.feedbackService.getAllFeedback();
    this.users = await this.adminService.getUsers();
    this.books = await this.adminService.getBooks();

    this.reportUsers = await Promise.all(
      this.reports.map((report) =>
        this.userService.getOtherUserInfo(report.userID),
      ),
    );
    this.reportBooks = await Promise.all(
      this.reports.map((report) => this.bookService.getBook(report.bookID)),
    );
    this.feedbackUsers = await Promise.all(
      this.feedback.map((feedbackItem) =>
        this.userService.getOtherUserInfo(feedbackItem.userID),
      ),
    );

    this.chartLabels = Object.keys(this.dbUsage);
    this.chartData = Object.values(this.dbUsage);
    this.chartColors = [this.generateColors(Object.keys(this.dbUsage).length)];
  }

  /**
   * Set a resource's value.
   *
   * @param name The resource name.
   */
  public async onSetResource(name: string): Promise<void> {
    this.settingResource = true;

    try {
      await this.resourceService.set(name, this.newResources[name]);
    } catch (err: any) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    }

    await this.resourceService.update();
    await this.updateInfo();

    this.settingResource = false;
  }

  /**
   * Reset a resource's value.
   *
   * @param name The resource name.
   */
  public async onResetResource(name: string): Promise<void> {
    this.resettingResource = true;

    try {
      await this.resourceService.reset(name);
    } catch (err: any) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    }

    await this.resourceService.update();
    await this.updateInfo();
    this.newResources[name] = this.resources[name];

    this.resettingResource = false;
  }

  /**
   * Delete a report.
   *
   * @param reportID The report ID.
   */
  public async onDeleteReport(reportID: string): Promise<void> {
    this.deletingReport = true;

    try {
      await this.reportService.deleteReport(reportID);
    } catch (err: any) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    }

    await this.updateInfo();

    this.deletingReport = false;

    await this.adminService.updateAdminNotifications();
  }

  /**
   * Open the delete reported book confirmation dialog.
   *
   * @param reportID The report ID.
   */
  public openDeleteReportBookConfirmationDialog(reportID: string): void {
    this.deletingReportID = reportID;

    this.deleteReportedBookConfirmationDialog.openDialog(
      this.deleteReportedBookConfirmationTemplate,
    );
  }

  /**
   * Delete a reported book.
   *
   * @param reportID The report ID.
   */
  public async onDeleteReportedBook(confirm: boolean): Promise<void> {
    if (confirm) {
      this.deletingReport = true;

      try {
        await this.reportService.deleteReportedBook(this.deletingReportID);
      } catch (err: any) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });
      }

      await this.updateInfo();

      this.deletingReport = false;

      await this.adminService.updateAdminNotifications();
    }

    this.deletingReportID = '';
  }

  /**
   * Delete a feedback submission.
   *
   * @param feedbackID The feedback ID.
   */
  public async onDeleteFeedback(feedbackID: string): Promise<void> {
    this.deletingFeedback = true;

    try {
      await this.feedbackService.deleteFeedback(feedbackID);
    } catch (err: any) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    }

    await this.updateInfo();

    this.deletingFeedback = false;

    await this.adminService.updateAdminNotifications();
  }

  /**
   * Compare two values.
   *
   * @param a The first value.
   * @param b The second value.
   * @param isAsc Whether to sort ascending.
   * @returns The comparison result.
   */
  private sortCompare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /**
   * Sort a set of data.
   *
   * @param currentData The data.
   * @param sort The sort parameters.
   * @returns The sorted data.
   */
  private sortData<T>(currentData: T[], sort: Sort): T[] {
    const data = currentData.slice();

    if (!sort.active || sort.direction === '') {
      return data;
    } else {
      return data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        return this.sortCompare(
          (a as any)[sort.active],
          (b as any)[sort.active],
          isAsc,
        );
      });
    }
  }

  /**
   * Sort the users.
   *
   * @param sort The sort parameters.
   */
  public sortUsers(sort: Sort): void {
    this.sortedUsers = this.sortData(this.users, sort);
  }

  /**
   * Sort the books.
   *
   * @param sort The sort parameters.
   */
  public sortBooks(sort: Sort): void {
    this.sortedBooks = this.sortData(this.books, sort);
  }

  /**
   * Generate a set of distinct colors.
   *
   * @param numColors The number of colors to generate.
   * @returns The generated colors.
   */
  private generateColors(numColors: number): Color {
    return {
      backgroundColor: Array.from(Array(numColors).keys()).map(
        (value) => `hsl(${Math.round(value * 137.508) % 360}, 100%, 50%)`,
      ),
    };
  }
}
