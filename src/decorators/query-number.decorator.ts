/**
 * Decorator for a number query parameter.
 * @packageDocumentation
 */

import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { QueryParameters, queryDefaults } from './parameter';

/**
 * Decorator for a number query parameter.
 */
export const QueryNumber = createParamDecorator(
  (params: QueryParameters<number>, ctx: ExecutionContext) => {
    const { name, required, defaultValue, scope, parseNull } =
      queryDefaults(params);

    const request = ctx.switchToHttp().getRequest();
    const value =
      scope === 'query'
        ? request.query?.[name]
        : scope === 'body'
        ? request.body?.[name]
        : undefined;

    if (value === undefined || value === '') {
      if (required) {
        throw new BadRequestException(`Expected query parameter '${name}'`);
      } else {
        return defaultValue;
      }
    }

    if (parseNull && value === 'null') {
      return null;
    } else {
      if (!isNaN(parseFloat(value))) {
        return parseFloat(value);
      } else {
        throw new BadRequestException(
          `Expected number value for query parameter '${name}'`,
        );
      }
    }
  },
);
