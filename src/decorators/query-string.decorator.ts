import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator for a required string query parameter.
 */
export const QueryString = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query?.[data];
    return value;
  },
);
