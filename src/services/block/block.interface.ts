/**
 * User blocking interface.
 * @packageDocumentation
 */

/**
 * User blocking table schema.
 */
export interface NBBlock {
  userID: string;
  blockedUserID: string;
  blockTime: number;
}
