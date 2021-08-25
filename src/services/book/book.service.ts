import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DBService } from '../db/db.service';
import { ResourceService } from '../resource/resource.service';
import { ImageService } from '../image/image.service';
import { UserService } from '../user/user.service';
import { DepartmentService } from '../department/department.service';
import { BookConditionService } from '../book-condition/book-condition.service';
import { SearchSortService } from '../search-sort/search-sort.service';
import { NBBook } from './book.interface';
import { NBUser } from '../user/user.interface';
import { ServiceException } from '../service.exception';

/**
 * Options passed in creating a book.
 */
interface CreateBookOptions {
  userID: string;
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
interface EditBookOptions {
  title?: string;
  author?: string;
  description?: string;
  ISBN10?: string;
  ISBN13?: string;
  imageData?: string;
  departmentID?: number;
  courseNumber?: number;
  price?: number;
  conditionID?: number;
}

/**
 * Options passed in searching books.
 */
interface SearchBooksOptions {
  query?: string;
  departmentID?: number;
  courseNumber?: number;
}

/**
 * Book table service.
 */
@Injectable()
export class BookService {
  private readonly tableName = 'NB_BOOK';

  constructor(
    @Inject(forwardRef(() => DBService))
    private readonly dbService: DBService,
    @Inject(forwardRef(() => ResourceService))
    private readonly resourceService: ResourceService,
    @Inject(forwardRef(() => ImageService))
    private readonly imageService: ImageService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
    @Inject(forwardRef(() => BookConditionService))
    private readonly bookConditionService: BookConditionService,
    @Inject(forwardRef(() => SearchSortService))
    private readonly searchSortService: SearchSortService,
  ) {}

  /**
   * Create a new book.
   *
   * @param options The new book options.
   * @returns The new book record.
   */
  public async createBook(options: CreateBookOptions): Promise<NBBook> {
    const userMaxBooks = await this.resourceService.getResource<number>(
      'USER_MAX_BOOKS',
    );
    const bookTitleMaxLength = await this.resourceService.getResource<number>(
      'BOOK_TITLE_MAX_LENGTH',
    );
    const bookAuthorMaxLength = await this.resourceService.getResource<number>(
      'BOOK_AUTHOR_MAX_LENGTH',
    );
    const bookDescriptionMaxLength =
      await this.resourceService.getResource<number>(
        'BOOK_DESCRIPTION_MAX_LENGTH',
      );

    const ISBN10 =
      options.ISBN10 === undefined
        ? undefined
        : options.ISBN10.replace(/-/g, '');
    const ISBN13 =
      options.ISBN13 === undefined
        ? undefined
        : options.ISBN13.replace(/-/g, '');

    const userExists = await this.userService.userExists(options.userID);

    if (userExists) {
      const currentBooks = await this.userService.getCurrentBooks(
        options.userID,
      );

      if (currentBooks.length < userMaxBooks) {
        if (
          options.title.length >= 1 &&
          options.title.length <= bookTitleMaxLength
        ) {
          if (
            options.author.length >= 1 &&
            options.author.length <= bookTitleMaxLength
          ) {
            if (
              options.description.length >= 1 &&
              options.description.length <= bookDescriptionMaxLength
            ) {
              if (ISBN10 === undefined || ISBN10.length === 10) {
                if (ISBN13 === undefined || ISBN13.length === 13) {
                  const departmentExists =
                    await this.departmentService.departmentExists(
                      options.departmentID,
                    );

                  if (departmentExists) {
                    if (
                      options.courseNumber === undefined ||
                      (options.courseNumber >= 101 &&
                        options.courseNumber <= 499)
                    ) {
                      if (options.price >= 0 && options.price <= 999.99) {
                        const bookConditionExists =
                          await this.bookConditionService.bookConditionExists(
                            options.conditionID,
                          );

                        if (bookConditionExists) {
                          const bookImage = await this.imageService.createImage(
                            options.imageData,
                          );

                          const book = await this.dbService.create<NBBook>(
                            this.tableName,
                            {
                              userID: options.userID,
                              title: options.title,
                              author: options.author,
                              description: options.description,
                              ISBN10,
                              ISBN13,
                              imageID: bookImage.id,
                              departmentID: options.departmentID,
                              courseNumber: options.courseNumber,
                              price: options.price,
                              conditionID: options.conditionID,
                            },
                          );

                          await this.userService.incrementBooksListed(
                            options.userID,
                          );

                          return book;
                        } else {
                          throw new ServiceException(
                            'Book condition does not exist',
                          );
                        }
                      } else {
                        throw new ServiceException(
                          'Price must be between $0 and $999.99',
                        );
                      }
                    } else {
                      throw new ServiceException(
                        'Course number must be between 101 and 499',
                      );
                    }
                  } else {
                    throw new ServiceException('Department does not exist');
                  }
                } else {
                  throw new ServiceException(
                    'ISBN 13 must be exactly 13 characters',
                  );
                }
              } else {
                throw new ServiceException(
                  'ISBN 10 must be exactly 10 characters',
                );
              }
            } else {
              throw new ServiceException(
                `Book description must be between 1 and ${bookDescriptionMaxLength} characters`,
              );
            }
          } else {
            throw new ServiceException(
              `Book author must be between 1 and ${bookAuthorMaxLength} characters`,
            );
          }
        } else {
          throw new ServiceException(
            `Book title must be between 1 and ${bookTitleMaxLength} characters`,
          );
        }
      } else {
        throw new ServiceException('Maximum number of books exceeded');
      }
    } else {
      throw new ServiceException('User does not exist');
    }
  }

  /**
   * Edit an existing book.
   *
   * @param bookID The book's ID.
   * @param options The updated book options.
   * @returns The updated book record.
   */
  public async editBook(
    bookID: string,
    options: EditBookOptions,
  ): Promise<NBBook> {
    const bookTitleMaxLength = await this.resourceService.getResource<number>(
      'BOOK_TITLE_MAX_LENGTH',
    );
    const bookAuthorMaxLength = await this.resourceService.getResource<number>(
      'BOOK_AUTHOR_MAX_LENGTH',
    );
    const bookDescriptionMaxLength =
      await this.resourceService.getResource<number>(
        'BOOK_DESCRIPTION_MAX_LENGTH',
      );

    const ISBN10 =
      options.ISBN10 === undefined
        ? undefined
        : options.ISBN10.replace(/-/g, '');
    const ISBN13 =
      options.ISBN13 === undefined
        ? undefined
        : options.ISBN13.replace(/-/g, '');

    const book = await this.getBook(bookID);

    if (
      options.title === undefined ||
      (options.title.length >= 1 && options.title.length <= bookTitleMaxLength)
    ) {
      if (
        options.author === undefined ||
        (options.author.length >= 1 &&
          options.author.length <= bookTitleMaxLength)
      ) {
        if (
          options.description === undefined ||
          (options.description.length >= 1 &&
            options.description.length <= bookDescriptionMaxLength)
        ) {
          if (ISBN10 === undefined || ISBN10.length === 10) {
            if (ISBN13 === undefined || ISBN13.length === 13) {
              const departmentExists =
                options.departmentID === undefined
                  ? true
                  : await this.departmentService.departmentExists(
                      options.departmentID,
                    );

              if (departmentExists) {
                if (
                  options.courseNumber === undefined ||
                  (options.courseNumber >= 101 && options.courseNumber <= 499)
                ) {
                  if (options.price >= 0 && options.price <= 999.99) {
                    const bookConditionExists =
                      options.conditionID === undefined
                        ? true
                        : await this.bookConditionService.bookConditionExists(
                            options.conditionID,
                          );

                    if (bookConditionExists) {
                      const sql = `UPDATE "${this.tableName}" SET "editTime" = NOW() WHERE id = ?;`;
                      const params = [book.id];
                      await this.dbService.execute(sql, params);

                      if (options.imageData !== undefined) {
                        await this.imageService.setImageData(
                          book.imageID,
                          options.imageData,
                        );
                      }

                      const editOptions = [
                        'title',
                        'author',
                        'description',
                        'ISBN10',
                        'ISBN13',
                        'departmentID',
                        'courseNumber',
                        'price',
                        'conditionID',
                      ];

                      const updateFields = editOptions
                        .filter((option) => options[option] !== undefined)
                        .reduce((acc, current) => {
                          acc[current] = options[current];
                          return acc;
                        }, {});

                      return this.dbService.updateByID<NBBook>(
                        this.tableName,
                        bookID,
                        updateFields,
                      );
                    } else {
                      throw new ServiceException(
                        'Book condition does not exist',
                      );
                    }
                  } else {
                    throw new ServiceException(
                      'Price must be between $0 and $999.99',
                    );
                  }
                } else {
                  throw new ServiceException(
                    'Course number must be between 101 and 499',
                  );
                }
              } else {
                throw new ServiceException('Department does not exist');
              }
            } else {
              throw new ServiceException(
                'ISBN 13 must be exactly 13 characters',
              );
            }
          } else {
            throw new ServiceException('ISBN 10 must be exactly 10 characters');
          }
        } else {
          throw new ServiceException(
            `Book description must be between 1 and ${bookDescriptionMaxLength} characters`,
          );
        }
      } else {
        throw new ServiceException(
          `Book author must be between 1 and ${bookAuthorMaxLength} characters`,
        );
      }
    } else {
      throw new ServiceException(
        `Book title must be between 1 and ${bookTitleMaxLength} characters`,
      );
    }
  }

  /**
   * Determine whether or not a book exists.
   *
   * @param bookID The book's ID.
   * @returns Whether or not the book exists.
   */
  public async bookExists(bookID: string): Promise<boolean> {
    const book = await this.dbService.getByID<NBBook>(this.tableName, bookID);
    return !!book;
  }

  /**
   * Get a book.
   *
   * @param bookID The book's ID.
   * @returns The book record.
   */
  public async getBook(bookID: string): Promise<NBBook> {
    const book = await this.dbService.getByID<NBBook>(this.tableName, bookID);

    if (book) {
      return book;
    } else {
      throw new ServiceException('Book does not exist');
    }
  }

  /**
   * Get the user who listed a book.
   *
   * @param bookID The book's ID.
   * @returns The user who listed the book.
   */
  public async getBookUser(bookID: string): Promise<NBUser> {
    const sql = `
      SELECT * FROM "NB_USER" WHERE id = (
        SELECT "userID" FROM "${this.tableName}" WHERE id = ?
      );`;
    const params = [bookID];
    const res = await this.dbService.execute<NBUser>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceException('Book does not exist');
    }
  }

  /**
   * Delete a book.
   *
   * @param bookID The book's ID.
   * @param sold Whether or not the book was sold.
   */
  public async deleteBook(bookID: string, sold: boolean): Promise<void> {
    const book = await this.getBook(bookID);

    if (sold) {
      await this.userService.incrementBooksSold(book.userID);
      await this.userService.addMoneyMade(book.userID, book.price);
    }

    await this.imageService.deleteImage(book.imageID);
    await this.dbService.deleteByID(this.tableName, book.id);
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
    const departmentExists =
      options.departmentID === undefined
        ? true
        : await this.departmentService.departmentExists(options.departmentID);

    if (departmentExists) {
      if (
        options.courseNumber === undefined ||
        (options.courseNumber >= 101 && options.courseNumber <= 499)
      ) {
        const sortOptionExists = await this.searchSortService.sortOptionExists(
          sortID,
        );

        if (sortOptionExists) {
          const query = options.query ?? '';
          const searchLike = `%${query}%`;
          const isbnSearch =
            options.query === undefined ? '' : options.query.replace(/-/g, '');
          const departmentQuery =
            options.departmentID === undefined
              ? ''
              : ' "departmentID" = ? AND ';
          const courseNumberQuery =
            options.courseNumber === undefined
              ? ''
              : ' "courseNumber" = ? AND ';
          const sortQuery = await this.searchSortService.getSortOption(sortID);

          const sql = `
            SELECT *
            FROM "${this.tableName}"
            WHERE
              ${departmentQuery} ${courseNumberQuery} (
                   LOWER("title")       LIKE LOWER(?)
                OR LOWER("author")      LIKE LOWER(?)
                OR LOWER("description") LIKE LOWER(?)
                OR "ISBN10"             LIKE ?
                OR "ISBN13"             LIKE ?
              )
            ORDER BY ${sortQuery.query};
          `;
          const params = [].concat(
            options.departmentID ?? [],
            options.courseNumber ?? [],
            Array(3).fill(searchLike),
            Array(2).fill(isbnSearch),
          );
          return this.dbService.execute<NBBook>(sql, params);
        } else {
          throw new ServiceException('Search sort option does not exist');
        }
      } else {
        throw new ServiceException('Course number must be between 101 and 499');
      }
    } else {
      throw new ServiceException('Department does not exist');
    }
  }
}
