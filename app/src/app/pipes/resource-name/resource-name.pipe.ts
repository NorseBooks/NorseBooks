import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transform resource names into a more readable format.
 */
@Pipe({
  name: 'resourceName',
})
export class ResourceNamePipe implements PipeTransform {
  transform(name: string): string {
    const withSpaces = name.replace(/_/g, ' ');
    return withSpaces[0].toUpperCase() + withSpaces.slice(1).toLowerCase();
  }
}
