export type KeyPrefix<
  P extends string,
  T extends Record<string | number, unknown>,
> = {
  [K in keyof T & (string | number) as `${P}${K}`]: T[K];
};
