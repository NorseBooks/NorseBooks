/**
 * A guard requiring that the user be an admin.
 * @packageDocumentation
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SessionService } from '../services/session/session.service';

/**
 * A guard requiring that the user be an admin.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionID: string | undefined = request.cookies?.sessionID;

    if (sessionID) {
      const user = await this.sessionService.getUserBySessionID(sessionID);

      if (user.admin) {
        request.userSession = user;
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new UnauthorizedException();
    }

    return true;
  }
}
