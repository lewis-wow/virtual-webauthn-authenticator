export * from './types/index.js';

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

/**
 * An interface for an object that can generate a standard JSON Web Key (JWK)
 * representation of its public key.
 */
export interface IPublicJsonWebKeyFactory {
  getPublicJsonWebKey(): MaybePromise<Jwk>;
}

/**
 * An interface for an object that can sign arbitrary data, such as a
 * server-side challenge.
 */
export interface ISigner {
  sign(data: Buffer): MaybePromise<Buffer>;
}
