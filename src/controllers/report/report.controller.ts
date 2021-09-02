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
import { SessionOptionalGuard } from '../../guards/session-optional.guard';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Report controller.
 */
@Controller('api/report')
@UseInterceptors(new ResponseInterceptor())
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

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
  ) {
    return this.reportService.reportBook(user.id, bookID, reason);
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
  ) {
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
  public async getAllReports() {
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
  ) {
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
  ) {
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
  public async reportedRecently(@UserSession() user: NBUser) {
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
  public async getUserReports(@UserSession() user: NBUser) {
    return this.reportService.getUserBookReports(user.id);
  }

  /**
   * Get all reports for a book.
   *
   * @param bookID The book's ID.
   * @returns All reports for the book.
   */
  @Get('book-reports')
  @UseGuards(AdminGuard)
  public async getBookReports(@QueryString({ name: 'bookID' }) bookID: string) {
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
  ) {
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
  ) {
    await this.reportService.deleteReportedBook(reportID);
  }
}
