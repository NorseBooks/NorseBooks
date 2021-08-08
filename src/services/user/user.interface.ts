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
