export type ValueOf<T extends Record<string | number | symbol, unknown>> =
  T[keyof T];
