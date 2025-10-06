export type ValueOf<T> = T[keyof T];

export type MaybePromise<T> = T | Promise<T>;

export type PropertyKey = string | number | symbol;

export type SwapKeysAndValues<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
