import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import { NBReport } from './report.interface';
import { NBBook } from '../book/book.interface';

/**
 * Report service.
 */
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private readonly apiService: APIService) {}

  /**
   * Report a book.
   *
   * @param bookID The book's ID.
   * @param reason The reason for the report.
   * @returns The new report.
   */
  public async reportBook(bookID: string, reason: string): Promise<NBReport> {
    return this.apiService.post<NBReport>('report', {
      query: { bookID, reason },
    });
  }

  /**
   * Get a report.
   *
   * @param reportID The report's ID.
   * @returns The report.
   */
  public async getReport(reportID: string): Promise<NBReport> {
    return this.apiService.get<NBReport>('report', { query: { reportID } });
  }

  /**
   * Get all reports.
   *
   * @returns All reports.
   */
  public async getAllReports(): Promise<NBReport[]> {
    return this.apiService.get<NBReport[]>('report/all');
  }

  /**
   * Determine whether or not a user has reported a book.
   *
   * @param bookID The book's ID.
   * @returns Whether or not the user has reported the book.
   */
  public async reportedBook(bookID: string): Promise<boolean> {
    return this.apiService.get<boolean>('report/reported', {
      query: { bookID },
    });
  }

  /**
   * Get the user's report for a book.
   *
   * @param bookID The book's ID.
   * @returns The report.
   */
  public async getBookReport(bookID: string): Promise<NBReport> {
    return this.apiService.get<NBReport>('report/book-report', {
      query: { bookID },
    });
  }

  /**
   * Determine whether or not the user has recently reported a book.
   *
   * @returns Whether or not the user has recently reported a book.
   */
  public async reportedRecently(): Promise<boolean> {
    return this.apiService.get<boolean>('report/reported-recently');
  }

  /**
   * Get all of the user's reports.
   *
   * @returns All reports made by the user.
   */
  public async getUserReports(): Promise<NBReport[]> {
    return this.apiService.get<NBReport[]>('report/user-reports');
  }

  /**
   * Get all of the user's reported books.
   *
   * @returns All books reported by the user.
   */
  public async getUserReportedBooks(): Promise<NBBook[]> {
    return this.apiService.get<NBBook[]>('report/user-reported-books');
  }

  /**
   * Get all reports for a book.
   *
   * @param bookID The book's ID.
   * @returns All reports for the book.
   */
  public async getBookReports(bookID: string): Promise<NBReport[]> {
    return this.apiService.get<NBReport[]>('report/book-reports', {
      query: { bookID },
    });
  }

  /**
   * Delete a report.
   *
   * @param reportID The report's ID.
   */
  public async deleteReport(reportID: string): Promise<void> {
    await this.apiService.delete('report', { query: { reportID } });
  }

  /**
   * Delete a reported book.
   *
   * @param reportID The report's ID.
   */
  public async deleteReportedBook(reportID: string): Promise<void> {
    await this.apiService.delete('report/book', { query: { reportID } });
  }
}
