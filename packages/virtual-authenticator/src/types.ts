import type { Jwk } from '@repo/keys';
import type { MaybePromise } from '@repo/types';

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
