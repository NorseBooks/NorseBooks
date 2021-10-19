/**
 * User interface.
 * @packageDocumentation
 */

/**
 * User table schema.
 */
export interface NBUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  passwordHash: string;
  imageID?: string;
  numBooksListed: number;
  numBooksSold: number;
  moneyMade: number;
  verified: boolean;
  admin: boolean;
  joinTime: number;
  lastLoginTime?: number;
}

/**
 * The currently logged in user's info.
 */
export interface UserInfo {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  imageID?: string;
  numBooksListed: number;
  numBooksSold: number;
  moneyMade: number;
  admin: boolean;
  joinTime: number;
}

/**
 * Another user's info.
 */
export interface OtherUserInfo {
  id: string;
  firstname: string;
  lastname: string;
  imageID?: string;
  joinTime: number;
}
