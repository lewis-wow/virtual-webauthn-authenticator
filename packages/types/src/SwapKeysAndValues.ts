export type SwapKeysAndValues<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
