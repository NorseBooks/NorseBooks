/**
 * Generic exception for the service layer.
 * @packageDocumentation
 */

import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Generic exception for the service layer.
 */
export class ServiceException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
