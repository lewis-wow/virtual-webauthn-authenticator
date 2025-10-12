import type { Jwk } from './Jwk.js';
import type { MaybePromise } from './MaybePromise.js';

export interface ICredentialPublicKey {
  getJwk: () => MaybePromise<Jwk>;
}
