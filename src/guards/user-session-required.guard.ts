import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../services/session/session.service';

/**
 * A guard requiring a user session.
 */
@Injectable()
export class UserSessionRequiredGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionID: string | undefined = request.cookies?.sessionID;

    if (sessionID) {
      const user = await this.sessionService.getUserBySessionID(sessionID);
      request.userSession = user;
    } else {
      throw new UnauthorizedException();
    }

    return true;
  }
}
