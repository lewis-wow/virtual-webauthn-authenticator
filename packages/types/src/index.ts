export * from './MaybePromise.js';

export type PropertyKey = string | number | symbol;

export type BufferLike = string | Buffer | ArrayBuffer | ArrayBufferView;

export type SwapKeysAndValues<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
