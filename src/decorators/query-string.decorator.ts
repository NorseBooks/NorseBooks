/**
 * Decorator for a string query parameter.
 * @packageDocumentation
 */

import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { QueryParameters, queryDefaults } from './parameter';

/**
 * Decorator for a string query parameter.
 */
export const QueryString = createParamDecorator(
  (params: QueryParameters<string>, ctx: ExecutionContext) => {
    const { name, required, defaultValue, scope, parseNull } =
      queryDefaults(params);

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

    if (parseNull && value === 'null') {
      return null;
    } else {
      return value;
    }
  },
);
