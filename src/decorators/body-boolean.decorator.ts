import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

/**
 * Decorator for a required boolean body parameter.
 */
export const BodyBoolean = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.body?.[data];

    if (value === undefined) {
      throw new BadRequestException(`Expected body parameter '${data}'`);
    }

    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      throw new BadRequestException(
        `Expected boolean value for body parameter '${data}'`,
      );
    }
  },
);
