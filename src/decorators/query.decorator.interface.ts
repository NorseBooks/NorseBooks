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
}

interface QueryParametersFull<T> {
  name: string;
  required: boolean;
  defaultValue: T;
  scope: ParameterScope;
}

export function queryDefaults<T>(
  params: QueryParameters<T>,
): QueryParametersFull<T> {
  return {
    name: params.name,
    required: params.required ?? true,
    defaultValue: params.defaultValue ?? undefined,
    scope: params.scope ?? 'query',
  };
}
