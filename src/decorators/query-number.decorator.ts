import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { QueryParameters, queryDefaults } from './query.decorator.interface';

/**
 * Decorator for a required number query parameter.
 */
export const QueryNumber = createParamDecorator(
  (params: QueryParameters<number>, ctx: ExecutionContext) => {
    const { name, required, defaultValue, scope } = queryDefaults(params);

    const request = ctx.switchToHttp().getRequest();
    const value =
      scope === 'query'
        ? request.query?.[name]
        : scope === 'body'
        ? request.body?.[name]
        : undefined;

    if (value === undefined) {
      if (required) {
        throw new BadRequestException(`Expected query parameter '${name}'`);
      } else {
        return defaultValue;
      }
    }

    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    } else {
      throw new BadRequestException(
        `Expected number value for query parameter '${name}'`,
      );
    }
  },
);
