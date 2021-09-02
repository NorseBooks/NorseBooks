import {
  Controller,
  UseGuards,
  UseInterceptors,
  Get,
  Post,
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { BookService } from '../../services/book/book.service';
import { SessionRequiredGuard } from '../../guards/session-required.guard';
import { QueryBoolean } from '../../decorators/query-boolean.decorator';
import { QueryNumber } from '../../decorators/query-number.decorator';
import { QueryString } from '../../decorators/query-string.decorator';
import { UserSession } from '../../decorators/user-session.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { NBUser } from '../../services/user/user.interface';

/**
 * Book controller.
 */
@Controller('api/book')
@UseInterceptors(new ResponseInterceptor())
export class BookController {
  constructor(private readonly bookService: BookService) {}

  /**
   * List a book.
   *
   * @param title The book's title.
   * @param author The book's author.
   * @param description The description of the book.
   * @param ISBN10 The book's ISBN 10.
   * @param ISBN13 The book's ISBN 13.
   * @param imageData The image data for the book.
   * @param departmentID The book's department ID.
   * @param courseNumber The book's course number.
   * @param price The price of the book.
   * @param conditionID The book's condition ID.
   * @param user The user.
   * @returns The new book.
   */
  @Post()
  @UseGuards(SessionRequiredGuard)
  public async listBook(
    @QueryString({ name: 'title' }) title: string,
    @QueryString({ name: 'author' }) author: string,
    @QueryString({ name: 'description' }) description: string,
    @QueryString({ name: 'ISBN10', required: false }) ISBN10: string,
    @QueryString({ name: 'ISBN13', required: false }) ISBN13: string,
    @QueryString({ name: 'imageData', scope: 'body' }) imageData: string,
    @QueryNumber({ name: 'departmentID' }) departmentID: number,
    @QueryNumber({ name: 'courseNumber', required: false })
    courseNumber: number,
    @QueryNumber({ name: 'price' }) price: number,
    @QueryNumber({ name: 'conditionID' }) conditionID: number,
    @UserSession() user: NBUser,
  ) {
    return this.bookService.createBook({
      userID: user.id,
      title,
      author,
      description,
      ISBN10,
      ISBN13,
      imageData,
      departmentID,
      courseNumber,
      price,
      conditionID,
    });
  }

  /**
   * Edit a book.
   *
   * @param bookID The book's ID.
   * @param title The book's title.
   * @param author The book's author.
   * @param description The book's description.
   * @param ISBN10 The book's ISBN 10.
   * @param ISBN13 The book's ISBN 13.
   * @param imageData The image data for the book.
   * @param departmentID The book's department ID.
   * @param courseNumber The book's course number.
   * @param price The price of the book.
   * @param conditionID The book's condition ID.
   * @param user The user.
   * @returns The updated book.
   */
  @Patch()
  @UseGuards(SessionRequiredGuard)
  public async editBook(
    @QueryString({ name: 'bookID' }) bookID: string,
    @QueryString({ name: 'title', required: false }) title: string,
    @QueryString({ name: 'author', required: false }) author: string,
    @QueryString({ name: 'description', required: false }) description: string,
    @QueryString({ name: 'ISBN10', required: false }) ISBN10: string,
    @QueryString({ name: 'ISBN13', required: false }) ISBN13: string,
    @QueryString({ name: 'imageData', required: false, scope: 'body' })
    imageData: string,
    @QueryNumber({ name: 'departmentID', required: false })
    departmentID: number,
    @QueryNumber({ name: 'courseNumber', required: false })
    courseNumber: number,
    @QueryNumber({ name: 'price', required: false }) price: number,
    @QueryNumber({ name: 'conditionID', required: false }) conditionID: number,
    @UserSession() user: NBUser,
  ) {
    const book = await this.bookService.getBook(bookID);

    if (book.userID === user.id) {
      return this.bookService.editBook(bookID, {
        title,
        author,
        description,
        ISBN10,
        ISBN13,
        imageData,
        departmentID,
        courseNumber,
        price,
        conditionID,
      });
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Get a book.
   *
   * @param bookID The book's ID.
   * @returns The book.
   */
  @Get()
  public async getBook(@QueryString({ name: 'bookID' }) bookID: string) {
    return this.bookService.getBook(bookID);
  }

  /**
   * Get a book's owner.
   *
   * @param bookID The book's ID.
   * @returns The book's owner.
   */
  @Get('owner')
  public async getBookOwner(@QueryString({ name: 'bookID' }) bookID: string) {
    const userInfo = await this.bookService.getBookUser(bookID);

    return {
      id: userInfo.id,
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      imageID: userInfo.imageID,
      joinTime: userInfo.joinTime,
    };
  }

  /**
   * Remove a book.
   *
   * @param bookID The book's ID.
   * @param sold Whether or not the book was sold.
   * @param user The user.
   */
  @Delete()
  @UseGuards(SessionRequiredGuard)
  public async removeBook(
    @QueryString({ name: 'bookID' }) bookID: string,
    @QueryBoolean({ name: 'sold' }) sold: boolean,
    @UserSession() user: NBUser,
  ) {
    const book = await this.bookService.getBook(bookID);

    if (book.userID === user.id) {
      await this.bookService.deleteBook(bookID, sold);
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Search for books.
   *
   * @param query The query string.
   * @param departmentID The department ID.
   * @param courseNumber The course number.
   * @param sortID The search sort ID.
   * @returns All books matching the search parameters.
   */
  @Get('search')
  public async searchBooks(
    @QueryString({ name: 'query', required: false }) query: string,
    @QueryNumber({ name: 'departmentID', required: false })
    departmentID: number,
    @QueryNumber({ name: 'courseNumber', required: false })
    courseNumber: number,
    @QueryNumber({ name: 'sortID' }) sortID: number,
  ) {
    return this.bookService.searchBooks(
      { query, departmentID, courseNumber },
      sortID,
    );
  }
}
