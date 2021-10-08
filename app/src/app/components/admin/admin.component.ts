import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { ReportService } from '../../services/report/report.service';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { AdminService } from '../../services/admin/admin.service';
import { Resources } from '../../services/resource/resource.interface';
import { NBBook } from '../../services/book/book.interface';
import { NBReport } from '../../services/report/report.interface';
import { NBFeedback } from '../../services/feedback/feedback.interface';
import {
  AdminStats,
  AdminDatabaseUsage,
  AdminUser,
} from '../../services/admin/admin.interface';

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

  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly reportService: ReportService,
    private readonly feedbackService: FeedbackService,
    private readonly adminService: AdminService,
  ) {}

  public async ngOnInit(): Promise<void> {
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

    this.done = true;
  }

  public async updateInfo(): Promise<void> {
    this.stats = await this.adminService.getStats();
    this.dbUsage = await this.adminService.getDatabaseUsage();
    this.resources = await this.resourceService.getAll();
    this.reports = await this.reportService.getAllReports();
    this.feedback = await this.feedbackService.getAllFeedback();
    this.users = await this.adminService.getUsers();
    this.books = await this.adminService.getBooks();
  }
}
