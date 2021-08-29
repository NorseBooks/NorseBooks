import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionService } from '../services/session/session.service';

/**
 * A guard for an optional user session.
 */
@Injectable()
export class UserSessionOptionalGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionID: string | undefined = request.cookies?.sessionID;

    if (sessionID) {
      const user = await this.sessionService.getUserBySessionID(sessionID);
      request.userSession = user;
    }

    return true;
  }
}
