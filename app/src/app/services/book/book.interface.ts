/**
 * Book info.
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

/**
 * Options passed in creating a book.
 */
export interface CreateBookOptions {
  title: string;
  author: string;
  description: string;
  ISBN10?: string;
  ISBN13?: string;
  imageData: string;
  departmentID: number;
  courseNumber?: number;
  price: number;
  conditionID: number;
}

/**
 * Options passed in editing a book.
 */
export interface EditBookOptions {
  title?: string;
  author?: string;
  description?: string;
  ISBN10?: string | null;
  ISBN13?: string | null;
  imageData?: string;
  departmentID?: number;
  courseNumber?: number | null;
  price?: number;
  conditionID?: number;
}

/**
 * Options passed in searching books.
 */
export interface SearchBooksOptions {
  query?: string;
  departmentID?: number;
  courseNumber?: number;
}
