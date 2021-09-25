import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { DepartmentService } from '../../services/department/department.service';
import { NBBook } from '../../services/book/book.interface';
import { PageEvent } from '@angular/material/paginator';

/**
 * A map of department IDs to names.
 */
interface DepartmentMap {
  [id: number]: string;
}

/**
 * A list of books.
 */
@Component({
  selector: 'nb-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
})
export class BookListComponent implements OnInit, OnChanges {
  @Input() books: NBBook[] = [];
  public currentPage = 0;
  public booksPerPage = 24;
  public pageSizeOptions = [3, 6, 12, 24, 48];
  public departments: DepartmentMap = {};
  public visibleBooks: NBBook[] = [];

  constructor(private readonly departmentService: DepartmentService) {}

  public async ngOnInit(): Promise<void> {
    const departments = await this.departmentService.getDepartments();
    this.departments = departments.reduce((acc, current) => {
      acc[current.id] = current.name;
      return acc;
    }, {} as DepartmentMap);
    this.visibleBooks = this.books.slice(0, this.booksPerPage);
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.books = changes.books.currentValue;
    this.selectPage(this.currentPage, this.booksPerPage);
  }

  /**
   * Select a page.
   *
   * @param pageIndex The page number.
   * @param pageSize The size of the page.
   */
  public selectPage(pageIndex: number, pageSize: number): void {
    const startIndex = pageIndex * pageSize;
    this.visibleBooks = this.books.slice(startIndex, startIndex + pageSize);
    this.currentPage = pageIndex;
    this.booksPerPage = pageSize;
  }

  /**
   * Update the displayed books when the page changes.
   *
   * @param event The page change event.
   */
  public onPageChange(event: PageEvent): void {
    this.selectPage(event.pageIndex, event.pageSize);
  }
}
