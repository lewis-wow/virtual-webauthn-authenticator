import type { Simplify } from 'type-fest';

type OmitUndefined<T> = Simplify<
  {
    // Part A: Keep keys that are NOT undefined as-is (Required)
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
  } & {
    // Part B: Handle keys that CAN be undefined
    // - Make them optional (?)
    // - Exclude 'undefined' from the value type
    [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
      T[K],
      undefined
    >;
  }
>;

export const omitUndefined = <T extends Record<PropertyKey, unknown>>(
  obj: T,
): OmitUndefined<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as OmitUndefined<T>;
};
