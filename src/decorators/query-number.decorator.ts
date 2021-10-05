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
    const { name, required, defaultValue, scope, parseNull, allowDecimal } =
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
        if (allowDecimal) {
          return parseFloat(value);
        } else {
          return parseInt(value);
        }
      } else {
        throw new BadRequestException(
          `Expected number value for query parameter '${name}'`,
        );
      }
    }
  },
);
