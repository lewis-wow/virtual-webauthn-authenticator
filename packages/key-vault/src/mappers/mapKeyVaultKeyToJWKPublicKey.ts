import type { JsonWebKey } from '@azure/keyvault-keys';
import type { JSONWebPublicKey } from '@repo/keys';
import { toB64 } from '@repo/utils';

export const mapKeyVaultKeyToJWKPublicKey = (
  azureKeyVaultJWKPublicKey: JsonWebKey,
): JSONWebPublicKey => {
  return {
    kty: azureKeyVaultJWKPublicKey.kty,
    crv: azureKeyVaultJWKPublicKey.crv,
    x: toB64(azureKeyVaultJWKPublicKey.x),
    y: toB64(azureKeyVaultJWKPublicKey.y),
    e: toB64(azureKeyVaultJWKPublicKey.e),
    n: toB64(azureKeyVaultJWKPublicKey.n),
  };
};
