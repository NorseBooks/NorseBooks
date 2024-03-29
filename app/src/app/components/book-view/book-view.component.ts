import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dialog } from '../dialog/dialog.component';
import { ResourceService } from '../../services/resource/resource.service';
import { UserService } from '../../services/user/user.service';
import { DepartmentService } from '../../services/department/department.service';
import { BookConditionService } from '../../services/book-condition/book-condition.service';
import { BookService } from '../../services/book/book.service';
import { ReportService } from '../../services/report/report.service';
import { UserInfo, OtherUserInfo } from '../../services/user/user.interface';
import { NBBook } from '../../services/book/book.interface';
import {
  inputAppearance,
  copyMessage,
  getBookImageURL,
  wait,
} from '../../globals';

/**
 * The book view page.
 */
@Component({
  selector: 'nb-book-view',
  templateUrl: './book-view.component.html',
  styleUrls: ['./book-view.component.scss'],
})
export class BookViewComponent implements OnInit {
  public reportReasonMaxLength = 1;
  public done = false;
  public bookExists = true;
  public loggedIn = false;
  public bookID = '';
  public bookInfo!: NBBook;
  public userInfo!: OtherUserInfo;
  public thisUserInfo!: UserInfo;
  public bookImageURL = '';
  public bookDepartment = '';
  public bookCondition = '';
  public reason = '';
  public bookSold = false;
  public reportedBook = false;
  public reportedRecently = false;
  public reportBookError = '';
  public reportingBook = false;
  public deleteBookError = '';
  public deletingBook = false;
  public readonly inputAppearance = inputAppearance;
  @ViewChild('reportReasonDialog') reportReasonDialog!: Dialog;
  @ViewChild('reportReasonTemplate') reportReasonTemplate!: TemplateRef<any>;
  @ViewChild('deleteBookConfirmationDialog')
  deleteBookConfirmationDialog!: Dialog;
  @ViewChild('deleteBookConfirmationTemplate')
  deleteBookConfirmationTemplate!: TemplateRef<any>;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly resourceService: ResourceService,
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly bookConditionService: BookConditionService,
    private readonly bookService: BookService,
    private readonly reportService: ReportService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.reportReasonMaxLength = await this.resourceService.get(
      'REPORT_REASON_MAX_LENGTH',
    );

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.bookID = paramMap.get('bookID') || '';

      this.loggedIn = this.userService.loggedIn();
      await this.updateBookInfo();

      if (this.loggedIn) {
        this.thisUserInfo = await this.userService.getUserInfo();
      }

      this.done = true;

      await wait(100);

      if (this.bookExists) {
        this.updateBookImage();
      }
    });
  }

  /**
   * Update the info on the book and report status.
   */
  public async updateBookInfo(): Promise<void> {
    try {
      this.bookInfo = await this.bookService.getBook(this.bookID);
    } catch (err) {
      this.bookExists = false;
      return;
    }

    this.userInfo = await this.bookService.getBookOwner(this.bookID);
    this.bookDepartment = await this.departmentService.getDepartment(
      this.bookInfo.departmentID,
    );
    this.bookCondition = await this.bookConditionService.getBookCondition(
      this.bookInfo.conditionID,
    );

    if (this.loggedIn) {
      this.reportedBook = await this.reportService.reportedBook(this.bookID);
      this.reportedRecently = await this.reportService.reportedRecently();
    }
  }

  /**
   * Copy the link to the book.
   */
  public copyBookLink(): void {
    copyMessage(window.location.href);

    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 3000,
      panelClass: 'alert-panel-center',
    });
  }

  /**
   * Open the report dialog.
   */
  public openReportBookDialog(): void {
    this.reportReasonDialog.openDialog(this.reportReasonTemplate);
  }

  /**
   * Report the book.
   *
   * @param confirm Whether the action was confirmed.
   */
  public async reportBook(confirm: boolean): Promise<void> {
    if (confirm) {
      this.reportBookError = '';
      this.reportingBook = true;

      try {
        await this.reportService.reportBook(this.bookID, this.reason);
        await this.updateBookInfo();
      } catch (err: any) {
        this.reportBookError = err;
      }

      this.reportingBook = false;
    }
  }

  /**
   * Open the delete confirmation dialog.
   */
  public openDeleteConfirmationDialog(): void {
    this.deleteBookConfirmationDialog.openDialog(
      this.deleteBookConfirmationTemplate,
    );
  }

  /**
   * Delete the book.
   *
   * @param confirm Whether the action was confirmed.
   */
  public async deleteBook(confirm: boolean): Promise<void> {
    if (confirm) {
      this.deleteBookError = '';
      this.deletingBook = true;

      try {
        await this.bookService.removeBook(this.bookID, this.bookSold);

        this.snackBar.open('Book deleted', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        await this.router.navigate(['/']);
      } catch (err: any) {
        this.deleteBookError = err;
      }

      this.deletingBook = false;
    }
  }

  /**
   * Update the book's image.
   */
  public updateBookImage(): void {
    this.bookImageURL = getBookImageURL(this.bookInfo);
    (document.getElementById('book-image') as HTMLImageElement).src =
      this.bookImageURL;
  }
}
