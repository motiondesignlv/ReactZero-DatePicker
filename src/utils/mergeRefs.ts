import { type Ref, type MutableRefObject } from 'react';

/**
 * Merges multiple React refs into a single ref callback.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}
