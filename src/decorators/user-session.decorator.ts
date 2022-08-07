/**
 * Decorator for a user session.
 * @packageDocumentation
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator for a user session.
 */
export const UserSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userSession;
  },
);
