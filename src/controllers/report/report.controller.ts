/**
 * Report controller.
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
import { ReportService } from '../../services/report/report.service';
import { NBReport } from '../../services/report/report.interface';
import { NBBook } from '../../services/book/book.interface';
import { ResourceService } from '../../services/resource/resource.service';
import { SessionOptionalGuard } from '../../guards/session-optional.guard';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { Hostname } from 'src/decorators/hostname.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';
import { sendFormattedEmail, emailAddress } from '../../emailer';

/**
 * Report controller.
 */
@Controller('api/report')
@UseInterceptors(new ResponseInterceptor())
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly resourceService: ResourceService,
  ) {}

  /**
   * Report a book.
   *
   * @param bookID The book's ID.
   * @param reason The reason for the report.
   * @param user The user.
   * @returns The new report.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async reportBook(
    @QueryString({ name: 'bookID' }) bookID: string,
    @QueryString({ name: 'reason' }) reason: string,
    @UserSession() user: NBUser,
    @Hostname() hostname: string,
  ): Promise<NBReport> {
    const report = await this.reportService.reportBook(user.id, bookID, reason);

    const adminEmails = await this.resourceService.getResource<boolean>(
      'ADMIN_EMAILS',
    );

    if (adminEmails) {
      await sendFormattedEmail(
        emailAddress,
        'Admin notification',
        'admin-notification',
        { hostname, notificationType: 'book report' },
      );
    }

    return report;
  }

  /**
   * Get a report.
   *
   * @param reportID The report's ID.
   * @param user The user.
   * @returns The report.
   */
  @Get()
  @UseGuards(SessionRequiredGuard)
  public async getReport(
    @QueryString({ name: 'reportID' }) reportID: string,
    @UserSession() user: NBUser,
  ): Promise<NBReport> {
    const report = await this.reportService.getReport(reportID);

    if (report.userID === user.id || user.admin) {
      return report;
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Get all reports.
   *
   * @returns All reports.
   */
  @Get('all')
  @UseGuards(AdminGuard)
  public async getAllReports(): Promise<NBReport[]> {
    return this.reportService.getReports();
  }

  /**
   * Determine whether or not a user has reported a book.
   *
   * @param bookID The book's ID.
   * @param user The user.
   * @returns Whether or not the user has reported the book.
   */
  @Get('reported')
  @UseGuards(SessionOptionalGuard)
  public async reportedBook(
    @QueryString({ name: 'bookID' }) bookID: string,
    @UserSession() user: NBUser,
  ): Promise<boolean> {
    return this.reportService.userReportedBook(user.id, bookID);
  }

  /**
   * Get the user's report for a book.
   *
   * @param bookID The book's ID.
   * @param user The user.
   * @returns The report.
   */
  @Get('book-report')
  @UseGuards(SessionRequiredGuard)
  public async getBookReport(
    @QueryString({ name: 'bookID' }) bookID: string,
    @UserSession() user: NBUser,
  ): Promise<NBReport> {
    return this.reportService.getUserBookReport(user.id, bookID);
  }

  /**
   * Determine whether or not a user has recently reported a book.
   *
   * @param user The user.
   * @returns Whether or not the user has recently reported a book.
   */
  @Get('reported-recently')
  @UseGuards(SessionRequiredGuard)
  public async reportedRecently(@UserSession() user: NBUser): Promise<boolean> {
    return this.reportService.userReportedRecently(user.id);
  }

  /**
   * Get all of the user's reports.
   *
   * @param user The user.
   * @returns All reports made by the user.
   */
  @Get('user-reports')
  @UseGuards(SessionRequiredGuard)
  public async getUserReports(
    @UserSession() user: NBUser,
  ): Promise<NBReport[]> {
    return this.reportService.getUserBookReports(user.id);
  }

  /**
   * Get all of the books reported by the user.
   *
   * @param user The user.
   * @returns All books reported by the user.
   */
  @Get('user-reported-books')
  @UseGuards(SessionRequiredGuard)
  public async getUserReportedBooks(
    @UserSession() user: NBUser,
  ): Promise<NBBook[]> {
    return this.reportService.getUserReportedBooks(user.id);
  }

  /**
   * Get all reports for a book.
   *
   * @param bookID The book's ID.
   * @returns All reports for the book.
   */
  @Get('book-reports')
  @UseGuards(AdminGuard)
  public async getBookReports(
    @QueryString({ name: 'bookID' }) bookID: string,
  ): Promise<NBReport[]> {
    return this.reportService.getBookReports(bookID);
  }

  /**
   * Delete a report.
   *
   * @param reportID The report's ID.
   * @param user The user.
   */
  @Delete()
  @UseGuards(SessionRequiredGuard)
  public async deleteReport(
    @QueryString({ name: 'reportID' }) reportID: string,
    @UserSession() user: NBUser,
  ): Promise<void> {
    const report = await this.reportService.getReport(reportID);

    if (report.userID === user.id || user.admin) {
      await this.reportService.deleteReport(reportID);
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Delete a reported book.
   *
   * @param reportID The report's ID.
   */
  @Delete('book')
  @UseGuards(AdminGuard)
  public async deleteReportedBook(
    @QueryString({ name: 'reportID' }) reportID: string,
  ): Promise<void> {
    await this.reportService.deleteReportedBook(reportID);
  }
}
