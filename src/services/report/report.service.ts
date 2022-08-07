/**
 * Report service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { BookService, bookTableName } from '../book/book.service';
import { NBReport } from './report.interface';
import { NBBook } from '../../services/book/book.interface';
import { ServiceException } from '../service.exception';

/**
 * Report table name.
 */
export const reportTableName = 'NB_REPORT';

/**
 * Report table service.
 */
@Injectable()
export class ReportService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
  ) {}

  /**
   * Report a book.
   *
   * @param userID The ID of the user reporting the book.
   * @param bookID The book's ID.
   * @param reason The reason for reporting.
   * @returns The new book record.
   */
  public async reportBook(
    userID: string,
    bookID: string,
    reason: string,
  ): Promise<NBReport> {
    const reportReasonMaxLength =
      await this.resourceService.getResource<number>(
        'REPORT_REASON_MAX_LENGTH',
      );

    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const bookExists = await this.bookService.bookExists(bookID);

      if (bookExists) {
        if (reason.length >= 1 && reason.length <= reportReasonMaxLength) {
          return this.dbService.create<NBReport>(reportTableName, {
            bookID,
            userID,
            reason,
          });
        } else {
          throw new ServiceException(
            `Report reason must be between 1 and ${reportReasonMaxLength} characters`,
          );
        }
      } else {
        throw new ServiceException('Book does not exist');
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Determine whether or not a report exists.
   *
   * @param reportID The report's ID.
   * @returns Whether or not the report exists.
   */
  public async reportExists(reportID: string): Promise<boolean> {
    const report = await this.dbService.getByID<NBReport>(
      reportTableName,
      reportID,
    );
    return !!report;
  }

  /**
   * Get a report.
   *
   * @param reportID The report's ID.
   * @returns The report record.
   */
  public async getReport(reportID: string): Promise<NBReport> {
    const report = await this.dbService.getByID<NBReport>(
      reportTableName,
      reportID,
    );

    if (report) {
      return report;
    } else {
      throw new ServiceException('Report does not exist');
    }
  }

  /**
   * Get all reports.
   *
   * @returns All reports.
   */
  public async getReports(): Promise<NBReport[]> {
    return this.dbService.list<NBReport>(reportTableName, {
      fieldName: 'reportTime',
      sortOrder: 'ASC',
    });
  }

  /**
   * Determine whether or not a user has reported a book.
   *
   * @param userID The user's ID.
   * @param bookID The book's ID.
   * @returns Whether or not the user has reported the book.
   */
  public async userReportedBook(
    userID: string,
    bookID: string,
  ): Promise<boolean> {
    const report = await this.dbService.getByFields<NBReport>(reportTableName, {
      userID,
      bookID,
    });
    return !!report;
  }

  /**
   * Get a user report for a book.
   *
   * @param userID The user's ID.
   * @param bookID The book's ID.
   * @returns The report.
   */
  public async getUserBookReport(
    userID: string,
    bookID: string,
  ): Promise<NBReport> {
    const report = await this.dbService.getByFields<NBReport>(reportTableName, {
      userID,
      bookID,
    });

    if (report) {
      return report;
    } else {
      throw new ServiceException('Report does not exist');
    }
  }

  /**
   * Determine whether or not a user has recently reported a book.
   *
   * @param userID The user's ID.
   * @returns Whether or not the user has recently reported a book.
   */
  public async userReportedRecently(userID: string): Promise<boolean> {
    const userReportCooldown = await this.resourceService.getResource<number>(
      'USER_REPORT_COOLDOWN',
    );

    const report = await this.dbService.getCustom<NBReport>(
      reportTableName,
      '"userID" = ? AND EXTRACT(EPOCH FROM NOW() - "reportTime") <= ?',
      [userID, userReportCooldown],
    );
    return !!report;
  }

  /**
   * Get all reports made by a user.
   *
   * @param userID The user's ID.
   * @returns All reports made by the user.
   */
  public async getUserBookReports(userID: string): Promise<NBReport[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      return this.dbService.listByFields<NBReport>(reportTableName, { userID });
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get all books reported by a user.
   *
   * @param userID The user's ID.
   * @returns All books reported by the user.
   */
  public async getUserReportedBooks(userID: string): Promise<NBBook[]> {
    const userExists = await this.userService.userExists(userID);

    if (userExists) {
      const sql = `
        SELECT "${bookTableName}".*
          FROM "${reportTableName}"
          JOIN "${bookTableName}"
            ON "${reportTableName}"."bookID" = "${bookTableName}".id
        WHERE "${reportTableName}"."userID" = ?
        ORDER BY "${reportTableName}"."reportTime" ASC;`;
      const params = [userID];
      return this.dbService.execute<NBBook>(sql, params);
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Get all reports for a book.
   *
   * @param bookID The book's ID.
   * @returns All reports for the book.
   */
  public async getBookReports(bookID: string): Promise<NBReport[]> {
    const bookExists = await this.bookService.bookExists(bookID);

    if (bookExists) {
      return this.dbService.listByFields<NBReport>(reportTableName, { bookID });
    } else {
      throw new ServiceException('Book does not exist');
    }
  }

  /**
   * Delete a report.
   *
   * @param reportID The report's ID.
   */
  public async deleteReport(reportID: string): Promise<void> {
    await this.dbService.deleteByID(reportTableName, reportID);
  }

  /**
   * Delete a reported book and all reports associated with it.
   *
   * @param reportID The report's ID.
   */
  public async deleteReportedBook(reportID: string): Promise<void> {
    const report = await this.getReport(reportID);

    await this.bookService.deleteBook(report.bookID, false);
  }
}
