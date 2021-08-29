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
    const value = request.query?.[data];

    if (value === undefined) {
      throw new BadRequestException(`Expected query parameter '${data}'`);
    }

    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    } else {
      throw new BadRequestException(
        `Expected number value for query parameter '${data}'`,
      );
    }
  },
);
