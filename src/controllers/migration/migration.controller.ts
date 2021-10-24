/**
 * Migration controller.
 * @packageDocumentation
 */

import { Controller, UseGuards, UseInterceptors, Patch } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { BookService } from '../../services/book/book.service';
import { MigrationGuard } from '../../guards/migration.guard';
import { QueryString } from '../../decorators/query-string.decorator';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';

/**
 * Migration controller.
 */
@Controller('api/migration')
@UseInterceptors(new ResponseInterceptor())
@UseGuards(MigrationGuard)
export class MigrationController {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) {}

  /**
   * Set a user's image.
   *
   * @param userID The user's ID.
   * @param imageData The image data for the user.
   */
  @Patch('user-image')
  public async setUserImage(
    @QueryString({ name: 'userID', scope: 'body' }) userID: string,
    @QueryString({ name: 'imageData', scope: 'body' }) imageData: string,
  ): Promise<void> {
    await this.userService.setUserImage(userID, imageData);
  }

  /**
   * Set a book's image.
   *
   * @param bookID The book's ID.
   * @param imageData The image data for the book.
   */
  @Patch('book-image')
  public async setBookImage(
    @QueryString({ name: 'bookID', scope: 'body' }) bookID: string,
    @QueryString({ name: 'imageData', scope: 'body' }) imageData: string,
  ): Promise<void> {
    await this.bookService.editBook(bookID, { imageData });
  }
}
