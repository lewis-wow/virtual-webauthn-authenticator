export * from './types/index.js';
export * from './Base64URLString.js';
export * from './ICredentialPublicKey.js';
export * from './ICredentialSigner.js';
export * from './Jwk.js';
export * from './MaybePromise.js';

export type PropertyKey = string | number | symbol;

export type BufferLike = string | Buffer | ArrayBuffer | ArrayBufferView;

export type SwapKeysAndValues<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
