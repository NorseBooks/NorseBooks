/**
 * Database service.
 * @packageDocumentation
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Pool, types } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv';
import { ResourceService } from '../resource/resource.service';
import { UserService } from '../user/user.service';
import { VerifyService } from '../verify/verify.service';
import { PasswordResetService } from '../password-reset/password-reset.service';

/**
 * Parse timestamp type.
 */
types.setTypeParser(1114, (timestamp) =>
  new Date(timestamp + '+0000').getTime(),
);

/**
 * Parse money type.
 */
types.setTypeParser(790, (amount) =>
  parseFloat(amount.slice(1).replace(/,/g, '')),
);

/**
 * Map of fields to values.
 */
interface FieldMap {
  [fieldName: string]: any;
}

/**
 * Query sort order options.
 */
type SortOrder = 'ASC' | 'DESC';

/**
 * Order options.
 */
interface OrderOptions {
  fieldName: string;
  sortOrder: SortOrder;
}

/**
 * Database initialization options
 */
interface InitDBOptions {
  populateStatic?: boolean;
  prune?: boolean;
}

/**
 * Database service.
 */
@Injectable()
export class DBService {
  private pool: Pool;
  private closed = false;
  private sqlPath = path.join('src', 'sql');
  private testing = !!parseInt(process.env.TESTING);
  private dbURL = !this.testing
    ? process.env.DATABASE_URL
    : process.env.HEROKU_POSTGRESQL_SILVER_URL;
  private logErrors = true;
  private tables = [
    'NB_RESOURCE',
    'NB_IMAGE',
    'NB_USER',
    'NB_SESSION',
    'NB_VERIFY',
    'NB_PASSWORD_RESET',
    'NB_DEPARTMENT',
    'NB_BOOK_CONDITION',
    'NB_BOOK',
    'NB_REPORT',
    'NB_MESSAGE',
    'NB_SEARCH_SORT',
    'NB_FEEDBACK',
    'NB_USER_INTEREST',
    'NB_REFERRAL',
    'NB_BLOCK',
  ];

  constructor(
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => VerifyService))
    private readonly verifyService: VerifyService,
    @Inject(forwardRef(() => PasswordResetService))
    private readonly passwordResetService: PasswordResetService,
  ) {
    this.pool = new Pool({
      connectionString: this.dbURL,
      ssl: { rejectUnauthorized: false },
      max: 20,
    });

    if (!this.testing) {
      this.initDB({ populateStatic: true, prune: true });
    }
  }

  /**
   * Provides information on an error.
   *
   * @param stmt The SQL statement.
   * @param params The query parameters.
   * @param res The query response.
   * @param err The error thrown.
   */
  private logError(stmt: string, params: any[], res: any, err: Error) {
    const msg = `\n\n######### ERROR #########\n\n\nStatement:\n${stmt}\n\nParameters:\n${params}\n\nResponse:\n${res}\n\nError:\n${err}`;
    console.error(msg);
  }

  /**
   * Transforms question mark query param indicators.
   *
   * @param stmt The SQL statement.
   * @returns The query with transformed parameters.
   */
  private transformParams(stmt: string): string {
    let paramCount = 0;
    while (stmt.includes('?')) {
      stmt = stmt.replace('?', `$${++paramCount}`);
    }
    return stmt;
  }

  /**
   * Execute a SQL query.
   *
   * @param stmt SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Query results.
   */
  public async execute<T = void>(
    stmt: string,
    params: any[] = [],
  ): Promise<T[]> {
    const conn = await this.pool.connect();

    stmt = this.transformParams(stmt);

    try {
      const res = await conn.query(stmt, params);
      conn.release();
      return res.rows;
    } catch (err) {
      if (this.logErrors) {
        this.logError(stmt, params, undefined, err);
      }
      conn.release();
      throw err;
    }
  }

  /**
   * Execute multiple SQL queries, each one right after the last
   *
   * @param stmts SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Results of all queries.
   */
  public async executeMany<T = void>(
    stmts: string[],
    params: any[][] = [],
  ): Promise<T[][]> {
    const conn = await this.pool.connect();
    const res: T[][] = [];

    stmts = stmts.map((stmt) => this.transformParams(stmt));

    for (let i = 0; i < stmts.length; i++) {
      try {
        const results = await conn.query(stmts[i], params[i] || []);
        res.push(results.rows);
      } catch (err) {
        if (this.logErrors) {
          this.logError(stmts[i], params[i], undefined, err);
        }
        conn.release();
        throw err;
      }
    }

    return res;
  }

  /**
   * Execute a SQL file.
   *
   * @param filename The SQL file to execute.
   * @param params Values to be inserted into the statement.
   * @param sqlPath The SQL files path.
   * @returns Query results.
   */
  public async executeFile<T = void>(
    filename: string,
    params: any[] = [],
    sqlPath: string = null,
  ): Promise<T[]> {
    sqlPath = sqlPath || this.sqlPath;
    const filepath = sqlPath ? path.join(sqlPath, filename) : filename;
    const sql = await fs.promises.readFile(filepath);
    const stmt = this.transformParams(sql.toString());
    const res = await this.execute<T>(stmt, params);
    return res;
  }

  /**
   * Execute multiple SQL files.
   *
   * @param filenames The SQL files to execute.
   * @param params Values to be inserted into the statement.
   * @param sqlPath The SQL files path.
   * @returns Results of all queries.
   */
  public async executeFiles<T = void>(
    filenames: string[],
    params: any[][] = [],
    sqlPath: string = null,
  ): Promise<T[][]> {
    const res: T[][] = [];

    for (let i = 0; i < filenames.length; i++) {
      sqlPath = sqlPath || this.sqlPath;
      const filepath = sqlPath
        ? path.join(sqlPath, filenames[i])
        : filenames[i];
      const sql = await fs.promises.readFile(filepath);
      const stmt = this.transformParams(sql.toString());
      const results = await this.execute<T>(stmt, params[i] || []);
      res.push(results);
    }

    return res;
  }

  /**
   * Execute all SQL files in a directory.
   *
   * @param directory The directory containing SQL files.
   * @param ext The extension of the SQL files.
   * @param sqlPath The SQL files path.
   * @returns Results of all queries.
   */
  public async executeAllFiles<T = void>(
    directory: string,
    ext = '.sql',
    sqlPath: string = null,
  ): Promise<T[][]> {
    sqlPath = sqlPath || this.sqlPath;
    const dirpath = sqlPath ? path.join(sqlPath, directory) : directory;
    const filenames = (await fs.promises.readdir(dirpath)).filter((filename) =>
      filename.endsWith(ext),
    );
    return this.executeFiles(filenames, [], dirpath);
  }

  /**
   * Close the connection to the database.
   */
  public async close(): Promise<void> {
    if (!this.closed) {
      await this.pool.end();
      this.closed = true;
    }
  }

  /**
   * Populates a database table.
   *
   * @param tableName The table to populate.
   * @param values Values to be inserted into the table.
   */
  private async populateTable<T>(
    tableName: string,
    values: T[],
  ): Promise<void> {
    const rows = await this.execute<any>(`SELECT * FROM "${tableName}";`);

    if (rows.length === 0) {
      const columns = Object.keys(values[0])
        .map((columnName) => `"${columnName}"`)
        .join(', ');
      const queryValues = values
        .map(
          (row) =>
            `(${Object.values(row)
              .map((value) => `'${value}'`)
              .join(', ')})`,
        )
        .join(', ');

      const sql = `INSERT INTO "${tableName}" (${columns}) VALUES ${queryValues};`;
      await this.execute(sql);
    }
  }

  /**
   * Populates a static database table from a CSV file.
   *
   * @param tableName The table to populate.
   */
  private async populateStaticTable(tableName: string): Promise<void> {
    const rows = await this.execute<any>(`SELECT * FROM "${tableName}";`);

    if (rows.length === 0) {
      const data = await fs.promises.readFile(
        path.join('src', 'sql', 'tables', `${tableName}.csv`),
      );
      const parser = csv.parse(data, { columns: true });

      for await (const row of parser) {
        const keys = Object.keys(row)
          .map((key) => `"${key}"`)
          .join(', ');
        const values = Object.values(row)
          .map(() => '?')
          .join(', ');

        const sql = `INSERT INTO "${tableName}" (${keys}) VALUES (${values});`;
        const params = Object.values(row);
        await this.execute(sql, params);
      }
    }
  }

  /**
   * Get a static table's values.
   *
   * @param tableName The table name.
   * @returns The table values.
   */
  public async getStaticTable(tableName: string): Promise<any[]> {
    const data = await fs.promises.readFile(
      path.join('src', 'sql', 'tables', `${tableName}.csv`),
    );
    const parser = csv.parse(data, { columns: true });
    const table = [];

    for await (const row of parser) {
      table.push(row);
    }

    return table;
  }

  /**
   * Prune records from the database.
   */
  private async pruneRecords(): Promise<void> {
    await this.userService.pruneUnverifiedUsers();
    await this.verifyService.pruneVerifications();
    await this.passwordResetService.prunePasswordResets();
  }

  /**
   * Initialize the database.
   */
  public async initDB(options: InitDBOptions = {}): Promise<void> {
    await this.executeFiles(this.tables.map((table) => `init/${table}.sql`));

    if (options.populateStatic ?? true) {
      await this.populateStaticTable('NB_RESOURCE');
      await this.populateStaticTable('NB_DEPARTMENT');
      await this.populateStaticTable('NB_BOOK_CONDITION');
      await this.populateStaticTable('NB_SEARCH_SORT');
    }

    if (options.prune ?? true) {
      const pruneInterval = await this.resourceService.getResource<number>(
        'PRUNE_INTERVAL',
      );

      await this.pruneRecords();
      setInterval(async () => {
        await this.pruneRecords();
      }, pruneInterval * 1000);
    }
  }

  /**
   * Wipe the test database.
   */
  public async wipeTestDB(): Promise<void> {
    const testPool = new Pool({
      connectionString: process.env.HEROKU_POSTGRESQL_SILVER_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
    });

    const tablesReversed = [].concat(this.tables).reverse();

    for (const table of tablesReversed) {
      await testPool.query(`DROP TABLE IF EXISTS "${table}";`);
    }

    await testPool.end();
  }

  /**
   * Create a new record in the table.
   *
   * @param fields Field values to create in the new record.
   * @returns The new record.
   */
  public async create<T>(tableName: string, fields: FieldMap): Promise<T> {
    const sql = `
      INSERT INTO "${tableName}" (
        ${Object.keys(fields)
          .map((fieldName) => `"${fieldName}"`)
          .join(', ')}
      ) VALUES (
        ${Object.values(fields).map(() => '?')}
      ) RETURNING *;`;
    const params = Object.values(fields);

    const res = await this.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Get a record in the table by ID.
   *
   * @param id The record's ID.
   * @returns The record with the given ID.
   */
  public async getByID<T>(tableName: string, id: any): Promise<T> {
    const sql = `SELECT * FROM "${tableName}" WHERE "id" = ?;`;
    const params = [id];

    const res = await this.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Get a record by field values.
   *
   * @param fields Fields to query by.
   * @returns The first record matching the field values.
   */
  public async getByFields<T>(tableName: string, fields: FieldMap): Promise<T> {
    const sql = `
      SELECT * FROM "${tableName}" WHERE
      ${Object.keys(fields)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(' AND ')};`;
    const params = Object.values(fields);

    const res = await this.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Get a record using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param params The query parameters.
   * @returns The first record from the resulting set.
   */
  public async getCustom<T>(
    tableName: string,
    whereClause: string,
    params: any[] = [],
  ): Promise<T> {
    const sql = `SELECT * FROM "${tableName}" WHERE ${whereClause};`;

    const res = await this.execute<T>(sql, params);
    return res[0];
  }

  /**
   * List all records in the table.
   *
   * @param orderOptions Options for ordering the results.
   * @returns All records, ordered if applicable.
   */
  public async list<T>(
    tableName: string,
    orderOptions?: OrderOptions,
  ): Promise<T[]> {
    const orderClause = orderOptions
      ? ` ORDER BY "${orderOptions.fieldName}" ${orderOptions.sortOrder}`
      : '';
    const sql = `SELECT * FROM "${tableName}"${orderClause};`;

    const res = await this.execute<T>(sql);
    return res;
  }

  /**
   * List all records matching provided query values.
   *
   * @param fields Fields to query by.
   * @param orderOptions Options for ordering the results.
   * @returns All records matching the provided query values, ordered if applicable.
   */
  public async listByFields<T>(
    tableName: string,
    fields: FieldMap,
    orderOptions?: OrderOptions,
  ): Promise<T[]> {
    const orderClause = orderOptions
      ? ` ORDER BY "${orderOptions.fieldName}" ${orderOptions.sortOrder}`
      : '';
    const sql = `
      SELECT * FROM "${tableName}" WHERE
      ${Object.keys(fields)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(' AND ')}
      ${orderClause};`;
    const params = Object.values(fields);

    const res = await this.execute<T>(sql, params);
    return res;
  }

  /**
   * List all records using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param orderOptions Options for ordering the results.
   * @param params The query parameters.
   * @returns All records from the resulting set.
   */
  public async listCustom<T>(
    tableName: string,
    whereClause: string,
    orderOptions?: OrderOptions,
    params: any[] = [],
  ): Promise<T[]> {
    const orderClause = orderOptions
      ? ` ORDER BY "${orderOptions.fieldName}" ${orderOptions.sortOrder}`
      : '';
    const sql = `SELECT * FROM "${tableName}" WHERE ${whereClause}${orderClause};`;

    const res = await this.execute<T>(sql, params);
    return res;
  }

  /**
   * Update a record in the table by ID.
   *
   * @param id The record's ID.
   * @param fieldValues The updated field values.
   * @returns The updated record.
   */
  public async updateByID<T>(
    tableName: string,
    id: any,
    fieldValues: FieldMap,
  ): Promise<T> {
    const sql = `
      UPDATE "${tableName}" SET
      ${Object.keys(fieldValues)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(', ')}
      WHERE "id" = ?
      RETURNING *;`;
    const params = [...Object.values(fieldValues), id];

    const res = await this.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Update records matching provided query values.
   *
   * @param fields Fields to query by.
   * @param fieldValues The updated field values.
   * @returns The updated records.
   */
  public async updateByFields<T>(
    tableName: string,
    fields: FieldMap,
    fieldValues: FieldMap,
  ): Promise<T[]> {
    const sql = `
      UPDATE "${tableName}" SET
      ${Object.keys(fieldValues)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(', ')}
      WHERE
      ${Object.keys(fields)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(' AND ')}
      RETURNING *;`;
    const params = [...Object.values(fieldValues), ...Object.values(fields)];

    const res = await this.execute<T>(sql, params);
    return res;
  }

  /**
   * Update records using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param fieldValues The updated field values.
   * @param params The query parameters.
   * @returns The updated records.
   */
  public async updateCustom<T>(
    tableName: string,
    whereClause: string,
    fieldValues: FieldMap,
    params: any[] = [],
  ): Promise<T[]> {
    const sql = `
      UPDATE "${tableName}" SET
      ${Object.keys(fieldValues)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(', ')}
      WHERE ${whereClause}
      RETURNING *;`;
    params = [...Object.values(fieldValues), ...params];

    const res = await this.execute<T>(sql, params);
    return res;
  }

  /**
   * Delete a record in the table by ID.
   *
   * @param id The record's ID.
   */
  public async deleteByID(tableName: string, id: any): Promise<void> {
    const sql = `DELETE FROM "${tableName}" WHERE "id" = ?;`;
    const params = [id];

    await this.execute(sql, params);
  }

  /**
   * Delete records matching provided query values.
   *
   * @param fields Fields to query by.
   */
  public async deleteByFields(
    tableName: string,
    fields: FieldMap,
  ): Promise<void> {
    const sql = `
      DELETE FROM "${tableName}" WHERE
      ${Object.keys(fields)
        .map((fieldName) => `"${fieldName}" = ?`)
        .join(' AND ')};`;
    const params = Object.values(fields);

    await this.execute(sql, params);
  }

  /**
   * Delete records using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param params The query parameters.
   */
  public async deleteCustom(
    tableName: string,
    whereClause: string,
    params: any[] = [],
  ): Promise<void> {
    const sql = `DELETE FROM "${tableName}" WHERE ${whereClause};`;

    await this.execute(sql, params);
  }
}
