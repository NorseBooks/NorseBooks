/**
 * Types, interfaces, and functions involving query and body parameters.
 * @packageDocumentation
 */

/**
 * The scope of the parameter.
 */
type ParameterScope = 'query' | 'body';

/**
 * Parameters for a request query field.
 */
export interface QueryParameters<T> {
  name: string;
  required?: boolean;
  defaultValue?: T;
  scope?: ParameterScope;
  parseNull?: boolean;
}

/**
 * Fully defined parameters for a request query field.
 */
interface QueryParametersFull<T> {
  name: string;
  required: boolean;
  defaultValue: T;
  scope: ParameterScope;
  parseNull: boolean;
}

/**
 * Set default query parameters.
 *
 * @param params The query parameters.
 * @returns Fully defined query parameters.
 */
export function queryDefaults<T>(
  params: QueryParameters<T>,
): QueryParametersFull<T> {
  return {
    name: params.name,
    required: params.required ?? true,
    defaultValue: params.defaultValue ?? undefined,
    scope: params.scope ?? 'query',
    parseNull: params.parseNull ?? false,
  };
}
