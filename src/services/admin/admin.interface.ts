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

/**
 * A user as seen by an admin.
 */
export interface AdminUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  imageID: string;
  numBooksListed: number;
  numBooksSold: number;
  moneyMade: number;
  verified: boolean;
  admin: boolean;
  joinTime: number;
}
