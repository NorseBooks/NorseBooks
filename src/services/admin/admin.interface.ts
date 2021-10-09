/**
 * Admin interfaces.
 * @packageDocumentation
 */

/**
 * Admin statistics.
 */
export interface AdminStats {
  users: number;
  books: number;
  booksListed: number;
  booksSold: number;
  moneyMade: number;
  tables: number;
  rows: number;
  capacity: number;
  reports: number;
  feedback: number;
}

/**
 * Database usage statistics.
 */
export interface AdminDatabaseUsage {
  [tableName: string]: number;
}
