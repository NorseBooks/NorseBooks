/**
 * A guard requiring that migration mode be on.
 * @packageDocumentation
 */

import { CanActivate, Injectable } from '@nestjs/common';

/**
 * A guard requiring that migration mode be on.
 */
@Injectable()
export class MigrationGuard implements CanActivate {
  public canActivate(): boolean {
    return process.env.MIGRATION === '1';
  }
}
