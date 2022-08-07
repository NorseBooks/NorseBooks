/**
 * Report interface.
 * @packageDocumentation
 */

/**
 * Report table schema.
 */
export interface NBReport {
  id: string;
  bookID: string;
  userID: string;
  reason: string;
  reportTime: number;
}
