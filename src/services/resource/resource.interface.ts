/**
 * Resource table schema.
 */
export interface NBResource<T extends boolean | number | string> {
  name: string;
  value: T;
  type: string;
}
