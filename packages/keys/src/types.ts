import type { JsonWebKey } from 'node:crypto';

/**
 * The standard interface for a JSON Web Key.
 */
export interface Jwk extends JsonWebKey {
  alg?: string;
}
