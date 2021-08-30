import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

/**
 * Decorator for a required number body parameter.
 */
export const BodyNumber = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.body?.[data];

    if (value === undefined) {
      throw new BadRequestException(`Expected body parameter '${data}'`);
    }

    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    } else {
      throw new BadRequestException(
        `Expected number value for body parameter '${data}'`,
      );
    }
  },
);
