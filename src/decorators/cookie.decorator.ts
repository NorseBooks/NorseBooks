import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator for getting a cookie.
 */
export const Cookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);
