/**
 * Resource interface.
 * @packageDocumentation
 */

/**
 * Resource table schema.
 */
export interface NBResource<T extends boolean | number | string> {
  name: string;
  value: T;
  type: string;
}

/**
 * Mapping of resource keys to values.
 */
export interface ResourceMap {
  [name: string]: {
    value: boolean | number | string;
    type: string;
  };
}
