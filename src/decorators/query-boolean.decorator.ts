/**
 * Decorator for a boolean query parameter.
 * @packageDocumentation
 */

import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { QueryParameters, queryDefaults } from './parameter';

/**
 * Decorator for a boolean query parameter.
 */
export const QueryBoolean = createParamDecorator(
  (params: QueryParameters<boolean>, ctx: ExecutionContext) => {
    const { name, required, defaultValue, scope } = queryDefaults(params);

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

    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      throw new BadRequestException(
        `Expected boolean value for query parameter '${name}'`,
      );
    }
  },
);
