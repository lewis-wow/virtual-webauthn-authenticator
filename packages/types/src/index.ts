export * from './types/index.js';
export * from './Base64URLString.js';

import type { JsonWebKey } from 'node:crypto';

export type MaybePromise<T> = T | Promise<T>;

export type PropertyKey = string | number | symbol;

export type BufferLike = string | Buffer | ArrayBuffer | ArrayBufferView;

export type SwapKeysAndValues<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

/**
 * The standard interface for a JSON Web Key.
 */
export interface Jwk extends JsonWebKey {
  alg?: string;
}

export interface ICredentialPublicKey {
  getJwk: () => MaybePromise<Jwk>;
}

export interface ICredentialSigner {
  sign: (data: Buffer) => MaybePromise<Buffer>;
}
