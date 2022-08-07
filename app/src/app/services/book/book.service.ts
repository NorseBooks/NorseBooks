import { Injectable } from '@angular/core';
import { APIService } from '../api/api.service';
import {
  NBBook,
  CreateBookOptions,
  EditBookOptions,
  SearchBooksOptions,
} from './book.interface';
import { OtherUserInfo } from '../user/user.interface';

/**
 * Book service.
 */
@Injectable({
  providedIn: 'root',
})
export class BookService {
  constructor(private readonly apiService: APIService) {}

  /**
   * List a new book.
   *
   * @param options The new book options.
   * @returns The new book.
   */
  public async listBook(options: CreateBookOptions): Promise<NBBook> {
    return this.apiService.post<NBBook>('book', {
      query: {
        title: options.title,
        author: options.author,
        description: options.description,
        ISBN10: options.ISBN10,
        ISBN13: options.ISBN13,
        departmentID: options.departmentID,
        courseNumber: options.courseNumber,
        price: options.price,
        conditionID: options.conditionID,
      },
      body: { imageData: options.imageData },
    });
  }

  /**
   * Edit an existing book.
   *
   * @param bookID The book's ID.
   * @param options The updated book options.
   * @returns The updated book.
   */
  public async editBook(
    bookID: string,
    options: EditBookOptions,
  ): Promise<NBBook> {
    return this.apiService.patch<NBBook>('book', {
      query: {
        bookID,
        title: options.title,
        author: options.author,
        description: options.description,
        ISBN10: options.ISBN10,
        ISBN13: options.ISBN13,
        departmentID: options.departmentID,
        courseNumber: options.courseNumber,
        price: options.price,
        conditionID: options.conditionID,
      },
      body: { imageData: options.imageData },
    });
  }

  /**
   * Get a book.
   *
   * @param bookID The book's ID.
   * @returns The book.
   */
  public async getBook(bookID: string): Promise<NBBook> {
    return this.apiService.get<NBBook>('book', { query: { bookID } });
  }

  /**
   * Get a book's owner.
   *
   * @param bookID The book's ID.
   * @returns The book's owner.
   */
  public async getBookOwner(bookID: string): Promise<OtherUserInfo> {
    return this.apiService.get<OtherUserInfo>('book/owner', {
      query: { bookID },
    });
  }

  /**
   * Remove a book.
   *
   * @param bookID The book's ID.
   * @param sold Whether or not the book was sold.
   */
  public async removeBook(bookID: string, sold: boolean): Promise<void> {
    await this.apiService.delete('book', { query: { bookID, sold } });
  }

  /**
   * Search for books.
   *
   * @param options The search options.
   * @param sortID The ID of the search sort option.
   * @returns All books matching the search parameters.
   */
  public async searchBooks(
    options: SearchBooksOptions,
    sortID: number,
  ): Promise<NBBook[]> {
    return this.apiService.get<NBBook[]>('book/search', {
      query: { ...options, sortID },
    });
  }
}
