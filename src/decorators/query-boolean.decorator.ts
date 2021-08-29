import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

/**
 * Decorator for a required boolean query parameter.
 */
export const QueryBoolean = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.query?.[data];

    if (value === undefined) {
      throw new BadRequestException(`Expected query parameter '${data}'`);
    }

    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      throw new BadRequestException(
        `Expected boolean value for query parameter '${data}'`,
      );
    }
  },
);
