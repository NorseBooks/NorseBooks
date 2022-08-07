import { Pipe, PipeTransform } from '@angular/core';

/**
 * Round a decimal value to a number of digits.
 */
@Pipe({
  name: 'round',
})
export class RoundPipe implements PipeTransform {
  transform(value: number, digits = 0): number {
    const multiplier = Math.pow(10, digits);
    return Math.round(multiplier * value) / multiplier;
  }
}
