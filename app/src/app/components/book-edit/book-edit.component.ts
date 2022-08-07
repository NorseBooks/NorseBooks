import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { DepartmentService } from '../../services/department/department.service';
import { BookConditionService } from '../../services/book-condition/book-condition.service';
import { BookService } from '../../services/book/book.service';
import { UserInfo } from '../../services/user/user.interface';
import { NBDepartment } from '../../services/department/department.interface';
import { NBBookCondition } from '../../services/book-condition/book-condition.interface';
import { NBBook } from '../../services/book/book.interface';
import { inputAppearance, acceptImageTypes } from '../../globals';

/**
 * The book edit page.
 */
@Component({
  selector: 'nb-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.scss'],
})
export class BookEditComponent implements OnInit {
  public bookTitleMaxLength = 1;
  public bookAuthorMaxLength = 1;
  public bookDescriptionMaxLength = 1;
  public done = false;
  public bookExists = true;
  public loggedIn = false;
  public bookID = '';
  public bookInfo!: NBBook;
  public newBook!: NBBook;
  public thisUserInfo!: UserInfo;
  public submittingEditBookForm = false;
  public editBookError = '';
  public departments: NBDepartment[] = [];
  public bookConditions: NBBookCondition[] = [];
  public imageData = '';
  public readonly inputAppearance = inputAppearance;
  public readonly acceptImageTypes = acceptImageTypes;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly bookConditionService: BookConditionService,
    private readonly bookService: BookService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.bookTitleMaxLength = await this.resourceService.get(
      'BOOK_TITLE_MAX_LENGTH',
    );
    this.bookAuthorMaxLength = await this.resourceService.get(
      'BOOK_AUTHOR_MAX_LENGTH',
    );
    this.bookDescriptionMaxLength = await this.resourceService.get(
      'BOOK_DESCRIPTION_MAX_LENGTH',
    );

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.bookID = paramMap.get('bookID') || '';

      this.loggedIn = this.userService.loggedIn();

      try {
        this.bookInfo = await this.bookService.getBook(this.bookID);
      } catch (err) {
        this.bookExists = false;
        return;
      }

      if (!this.loggedIn) {
        await this.router.navigate(['unauthorized'], {
          queryParams: { after: `edit/${this.bookID}` },
        });
      }

      this.thisUserInfo = await this.userService.getUserInfo();

      if (this.bookInfo.userID !== this.thisUserInfo.id) {
        await this.router.navigate(['forbidden']);
      }

      this.departments = await this.departmentService.getDepartments();
      this.bookConditions = await this.bookConditionService.getBookConditions();
      this.newBook = { ...this.bookInfo };

      this.done = true;
    });
  }

  /**
   * Select an image.
   *
   * @param imageData The image's data.
   */
  public async imageSelected(imageData: string): Promise<void> {
    this.imageData = btoa(imageData);
  }

  /**
   * Create a book.
   *
   * @param form The book creation form.
   */
  public async onEditBook(): Promise<void> {
    this.editBookError = '';
    this.submittingEditBookForm = true;

    try {
      await this.bookService.editBook(this.bookID, {
        title: this.newBook.title,
        author: this.newBook.author,
        description: this.newBook.description,
        ISBN10: this.newBook.ISBN10 || null,
        ISBN13: this.newBook.ISBN13 || null,
        imageData: this.imageData || undefined,
        departmentID: this.newBook.departmentID,
        courseNumber: this.newBook.courseNumber || null,
        price: this.newBook.price,
        conditionID: this.newBook.conditionID,
      });

      await this.router.navigate(['book', this.bookID]);
    } catch (err: any) {
      this.editBookError = err;
    }

    this.submittingEditBookForm = false;
  }
}
