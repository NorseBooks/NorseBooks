import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

/**
 * Decorator for a required string body parameter.
 */
export const BodyString = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.body?.[data];

    if (value === undefined) {
      throw new BadRequestException(`Expected body parameter '${data}'`);
    }

    return value;
  },
);
