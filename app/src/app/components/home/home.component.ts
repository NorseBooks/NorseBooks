import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { DepartmentService } from '../../services/department/department.service';
import { BookService } from '../../services/book/book.service';
import { SearchSortService } from '../../services/search-sort/search-sort.service';
import { NBDepartment } from '../../services/department/department.interface';
import { NBBook } from '../../services/book/book.interface';
import { NBSearchSort } from '../../services/search-sort/search-sort.interface';
import { inputAppearance } from '../../globals';

/**
 * The search books form.
 */
interface SearchBooksForm {
  query?: string;
  departmentID?: number;
  courseNumber?: number;
  sortID: number;
}

/**
 * The app home page.
 */
@Component({
  selector: 'nb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public done = false;
  public loggedIn = false;
  public submittingSearch = false;
  public searchError = '';
  public defaultSortValue = -1;
  public departments: NBDepartment[] = [];
  public sortOptions: NBSearchSort[] = [];
  public searchResults: NBBook[] = [];
  public recommended: NBBook[] = [];
  public readonly inputAppearance = inputAppearance;

  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly bookService: BookService,
    private readonly searchSortService: SearchSortService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loggedIn = this.userService.loggedIn();
    this.departments = await this.departmentService.getDepartments();
    this.sortOptions = await this.searchSortService.getSortOptions();
    this.searchResults = await this.bookService.searchBooks({}, 0);
    this.defaultSortValue = 0;

    if (this.loggedIn) {
      try {
        this.recommended = await this.userService.getRecommendations();
      } catch (err) {
        await this.userService.logout();
        this.loggedIn = false;
      }
    }

    this.done = true;
  }

  /**
   * Search for books.
   *
   * @param form The search books form.
   */
  public async onSearchBooks(form: SearchBooksForm): Promise<void> {
    this.searchError = '';
    this.submittingSearch = true;

    try {
      this.searchResults = await this.bookService.searchBooks(
        {
          query: form.query,
          departmentID: form.departmentID,
          courseNumber: form.courseNumber,
        },
        form.sortID,
      );
    } catch (err: any) {
      this.searchError = err;
    }

    this.submittingSearch = false;
  }
}
