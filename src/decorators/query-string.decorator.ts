import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { QueryParameters, queryDefaults } from './query.decorator.interface';

/**
 * Decorator for a required string query parameter.
 */
export const QueryString = createParamDecorator(
  (params: QueryParameters<string>, ctx: ExecutionContext) => {
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

    return value;
  },
);
