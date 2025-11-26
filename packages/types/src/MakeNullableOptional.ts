export type MakeNullableOptional<T> = {
  // 1. If value accepts null/undefined, keep key and make it optional (?)
  [K in keyof T as null extends T[K]
    ? K
    : undefined extends T[K]
      ? K
      : never]?: T[K];
} & {
  // 2. If value does NOT accept null/undefined, keep key as is (required)
  [K in keyof T as null extends T[K]
    ? never
    : undefined extends T[K]
      ? never
      : K]: T[K];
};
