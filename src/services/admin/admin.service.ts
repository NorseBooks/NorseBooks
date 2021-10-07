/**
 * Admin service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ReportService } from '../report/report.service';
import { FeedbackService } from '../feedback/feedback.service';
import { userTableName } from '../user/user.service';
import { bookTableName } from '../book/book.service';
import { AdminStats, AdminDatabaseUsage } from './admin.interface';
import { NBUser } from '../user/user.interface';
import { NBBook } from '../book/book.interface';

/**
 * Admin service.
 */
@Injectable()
export class AdminService {
  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ReportService))
    private readonly reportService: ReportService,
    @Inject(forwardRef(() => FeedbackService))
    private readonly feedbackService: FeedbackService,
  ) {}

  /**
   * Get site statistics.
   *
   * @returns Site statistics.
   */
  public async getStats(): Promise<AdminStats> {
    const dbRows = 10000000;

    const dbUsage = await this.getDatabaseUsage();
    const tables = await this.getTables();
    const tableRows = await this.getAllTableRowCounts();

    const rowCount = tableRows.reduce((acc, current) => {
      acc += current.rows;
      return acc;
    }, 0);

    const booksListedSql = `
      SELECT SUM("numBooksListed") AS sum
        FROM "${userTableName}";`;
    const booksListedRes = await this.dbService.execute<{ sum: number }>(
      booksListedSql,
    );
    const booksListed =
      typeof booksListedRes[0].sum === 'string'
        ? parseInt(booksListedRes[0].sum)
        : booksListedRes[0].sum ?? 0;

    const booksSoldSql = `
      SELECT SUM("numBooksSold") AS sum
        FROM "${userTableName}";`;
    const booksSoldRes = await this.dbService.execute<{ sum: number }>(
      booksSoldSql,
    );
    const booksSold =
      typeof booksSoldRes[0].sum === 'string'
        ? parseInt(booksSoldRes[0].sum)
        : booksSoldRes[0].sum ?? 0;

    const moneyMadeSql = `
      SELECT SUM("moneyMade") AS sum
        FROM "${userTableName}";`;
    const moneyMadeRes = await this.dbService.execute<{ sum: number }>(
      moneyMadeSql,
    );
    const moneyMade =
      typeof moneyMadeRes[0].sum === 'string'
        ? parseFloat(moneyMadeRes[0].sum)
        : moneyMadeRes[0].sum ?? 0;

    const reports = await this.reportService.getReports();
    const feedback = await this.feedbackService.getAllFeedback();

    return {
      users: dbUsage.NB_USER,
      books: dbUsage.NB_BOOK,
      booksListed,
      booksSold,
      moneyMade,
      tables: tables.length,
      rows: rowCount,
      capacity: rowCount / dbRows,
      reports: reports.length,
      feedback: feedback.length,
    };
  }

  /**
   * Get all users on the site.
   *
   * @returns All users on the site.
   */
  public async getUsers(): Promise<NBUser[]> {
    return this.dbService.list<NBUser>(userTableName, {
      fieldName: 'joinTime',
      sortOrder: 'ASC',
    });
  }

  /**
   * Get all books on the site.
   *
   * @returns All books on the site.
   */
  public async getBooks(): Promise<NBBook[]> {
    return this.dbService.list<NBBook>(bookTableName, {
      fieldName: 'listTime',
      sortOrder: 'ASC',
    });
  }

  /**
   * Get the database usage statistics.
   *
   * @returns The database usage statistics.
   */
  public async getDatabaseUsage(): Promise<AdminDatabaseUsage> {
    const rowCounts = await this.getAllTableRowCounts();
    return rowCounts.reduce((acc, row) => {
      acc[row.table] = row.rows;
      return acc;
    }, {});
  }

  /**
   * Get all tables.
   *
   * @returns All tables.
   */
  private async getTables(): Promise<{ table: string }[]> {
    const sql = `
      SELECT table_name AS table
        FROM information_schema.tables
        WHERE table_schema = 'public';`;

    return this.dbService.execute<{ table: string }>(sql);
  }

  /**
   * Get all columns in a table.
   *
   * @param tableName The name of the table.
   * @returns All columns in the table.
   */
  private async getTableColumns(
    tableName: string,
  ): Promise<{ column: string }[]> {
    const sql = `
      SELECT column_name AS column
        FROM information_schema.columns
        WHERE table_name = ?;`;
    const params = [tableName];

    return this.dbService.execute<{ column: string }>(sql, params);
  }

  /**
   * Get all tables and their columns.
   *
   * @returns All tables and their columns.
   */
  private async getAllTableColumns(): Promise<
    { table: string; column: string }[]
  > {
    const sql = `
      SELECT
          information_schema.tables.table_name AS table,
          information_schema.columns.column_name AS column
        FROM information_schema.tables
        JOIN information_schema.columns
          ON information_schema.tables.table_name = information_schema.columns.table_name
        WHERE information_schema.tables.table_schema = 'public'
        ORDER BY "table", "column";`;

    return this.dbService.execute<{ table: string; column: string }>(sql);
  }

  /**
   * Get the row count for a table.
   *
   * @param tableName The name of the table.
   * @returns The row count for the table.
   */
  private async getTableRowCount(tableName: string): Promise<number> {
    const sql = `SELECT COUNT(*) FROM "${tableName}"`;
    const rows = await this.dbService.execute<{ rows: number }>(sql);

    return rows[0].rows;
  }

  /**
   * Get all table row counts.
   *
   * @returns All table row counts.
   */
  private async getAllTableRowCounts(): Promise<
    { table: string; rows: number }[]
  > {
    const sql = `
      SELECT
          table_name AS table, 
          (xpath('/row/cnt/text()', xml_count))[1]::text::int as rows
        FROM (
          SELECT
              table_name, table_schema, 
              query_to_xml(format('SELECT COUNT(*) as cnt from %I.%I', table_schema, table_name), false, true, '') as xml_count
            FROM information_schema.tables
            WHERE table_schema = 'public'
        ) foo
        ORDER BY "table" ASC;`;

    return this.dbService.execute<{ table: string; rows: number }>(sql);
  }
}
