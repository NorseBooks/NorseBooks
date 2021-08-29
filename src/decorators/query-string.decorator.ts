import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

/**
 * Decorator for a required string query parameter.
 */
export const QueryString = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query?.[data];

    if (value === undefined) {
      throw new BadRequestException(`Expected query parameter '${data}'`);
    }

    return value;
  },
);
