/**
 * Book interface.
 * @packageDocumentation
 */

/**
 * Book table schema.
 */
export interface NBBook {
  id: string;
  userID: string;
  title: string;
  author: string;
  description: string;
  ISBN10?: string;
  ISBN13?: string;
  imageID: string;
  departmentID: number;
  courseNumber?: number;
  price: number;
  conditionID: number;
  listTime: number;
  editTime?: number;
}
