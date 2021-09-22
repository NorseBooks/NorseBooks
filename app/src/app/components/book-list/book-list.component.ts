import { Component, OnInit, Input } from '@angular/core';
import { DepartmentService } from '../../services/department/department.service';
import { NBBook } from '../../services/book/book.interface';

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
  public departments: DepartmentMap = {};

  constructor(private readonly departmentService: DepartmentService) {}

  public async ngOnInit(): Promise<void> {
    const departments = await this.departmentService.getDepartments();
    this.departments = departments.reduce((acc, current) => {
      acc[current.id] = current.name;
      return acc;
    }, {} as DepartmentMap);
  }
}
