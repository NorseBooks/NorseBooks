/**
 * Password reset interface.
 * @packageDocumentation
 */

/**
 * Password reset table schema.
 */
export interface NBPasswordReset {
  id: string;
  userID: string;
  createTime: number;
}
