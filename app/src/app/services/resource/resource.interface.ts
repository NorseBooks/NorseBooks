/**
 * Mapping of resource keys to values.
 */
export interface ResourceMap {
  [name: string]: {
    value: boolean | number | string;
    type: string;
  };
}
