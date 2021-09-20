import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { DepartmentService } from '../../services/department/department.service';
import { BookConditionService } from '../../services/book-condition/book-condition.service';
import { BookService } from '../../services/book/book.service';
import { NBDepartment } from '../../services/department/department.interface';
import { NBBookCondition } from '../../services/book-condition/book-condition.interface';
import { inputAppearance, acceptImageTypes } from '../../globals';

/**
 * The book creation form.
 */
interface CreateBookForm {
  title: string;
  author: string;
  description: string;
  ISBN10?: string;
  ISBN13?: string;
  departmentID: number;
  courseNumber?: number;
  price: number;
  conditionID: number;
}

/**
 * The book creation page.
 */
@Component({
  selector: 'nb-book-create',
  templateUrl: './book-create.component.html',
  styleUrls: ['./book-create.component.scss'],
})
export class BookCreateComponent implements OnInit {
  public bookTitleMaxLength = 1;
  public bookAuthorMaxLength = 1;
  public bookDescriptionMaxLength = 1;
  public done = false;
  public loggedIn = false;
  public submittingCreateBookForm = false;
  public createBookError = '';
  public departments: NBDepartment[] = [];
  public bookConditions: NBBookCondition[] = [];
  public imageData = '';
  public readonly inputAppearance = inputAppearance;
  public readonly acceptImageTypes = acceptImageTypes;

  constructor(
    private readonly router: Router,
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
    this.loggedIn = this.userService.loggedIn();
    this.departments = await this.departmentService.getDepartments();
    this.bookConditions = await this.bookConditionService.getBookConditions();

    this.done = true;
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
  public async onCreateBook(form: CreateBookForm): Promise<void> {
    if (this.imageData === '') {
      this.createBookError = 'Please select an image of the book';
    } else {
      this.createBookError = '';
      this.submittingCreateBookForm = true;

      try {
        const book = await this.bookService.listBook({
          title: form.title,
          author: form.author,
          description: form.description,
          ISBN10: form.ISBN10,
          ISBN13: form.ISBN13,
          imageData: this.imageData,
          departmentID: form.departmentID,
          courseNumber: form.courseNumber,
          price: form.price,
          conditionID: form.conditionID,
        });

        await this.router.navigate(['book', book.id]);
      } catch (err: any) {
        this.createBookError = err;
      }

      this.submittingCreateBookForm = false;
    }
  }
}
