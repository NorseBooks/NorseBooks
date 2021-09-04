/**
 * Decorator for getting the hostname.
 * @packageDocumentation
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator for getting the hostname.
 */
export const Hostname = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return `${request.protocol}://${request.get('host')}`;
  },
);
