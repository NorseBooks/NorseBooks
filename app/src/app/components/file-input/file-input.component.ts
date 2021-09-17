import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/**
 * A file input button.
 */
@Component({
  selector: 'nb-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
})
export class FileInputComponent implements OnInit {
  @Input() buttonLabel = 'Choose file';
  @Input() acceptTypes: string[] = [];
  @Output() fileChange = new EventEmitter<string>();
  public acceptTypesString = '*';

  public ngOnInit(): void {
    if (this.acceptTypes.length > 0) {
      this.acceptTypesString = this.acceptTypes.join(', ');
    }
  }

  /**
   * Emit an event when the file changes.
   *
   * @param event The file change event.
   */
  public onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (evt.target?.result) {
          this.fileChange.emit(evt.target.result as string);
        }
      };

      reader.readAsBinaryString(file);
    }
  }
}
