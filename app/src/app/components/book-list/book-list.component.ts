import { Component, OnInit, Input } from '@angular/core';
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
export class BookListComponent implements OnInit {
  @Input() books: NBBook[] = [];
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

  /**
   * Update the displayed books when the page changes.
   *
   * @param event The page change event.
   */
  public onPageChange(event: PageEvent): void {
    const startIndex = event.pageIndex * event.pageSize;
    this.visibleBooks = this.books.slice(
      startIndex,
      startIndex + event.pageSize,
    );
  }
}
