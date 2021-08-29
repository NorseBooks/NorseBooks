import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

/**
 * Decorator for a required number query parameter.
 */
export const QueryNumber = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = parseFloat(request.query?.[data]);

    if (!isNaN(value)) {
      return value;
    } else {
      throw new BadRequestException(
        `Expected number value for query parameter '${data}'`,
      );
    }
  },
);
