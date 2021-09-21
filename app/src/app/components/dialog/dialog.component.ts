import {
  Component,
  Inject,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

interface DialogData {
  title: string;
  doneButtonLabel: string;
  template: TemplateRef<any>;
}

/**
 * A dialog.
 */
@Component({
  selector: 'nb-dialog',
  template: '',
})
export class Dialog {
  @Input() title = 'Dialog';
  @Input() doneButtonLabel = 'Done';
  @Input() width = '400px';
  @Output() close = new EventEmitter<boolean>();

  constructor(public readonly dialog: MatDialog) {}

  /**
   * Open the dialog.
   */
  public openDialog(template: TemplateRef<any>): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: this.width,
      data: {
        title: this.title,
        doneButtonLabel: this.doneButtonLabel,
        template,
      },
    });

    dialogRef.afterClosed().subscribe((value) => this.close.emit(value));
  }
}

/**
 * A dialog component.
 */
@Component({
  selector: 'nb-dialog-component',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  /**
   * Close the dialog.
   */
  public cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Successfully close the dialog.
   */
  public done(): void {
    this.dialogRef.close(true);
  }
}
