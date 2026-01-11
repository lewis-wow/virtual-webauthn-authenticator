import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

/**
 * OKP keys (Ed25519/EdDSA) are NOT supported by Azure Key Vault.
 * Supported algorithms are EC (ES256, ES384, ES512) and RSA (RS256, RS384, RS512, PS256, PS384, PS512).
 */
export class OKPKeyTypeNotSupported extends Exception {
  static status = HttpStatusCode.BAD_REQUEST_400;
  static readonly code = 'OKPKeyTypeNotSupported';
  static message =
    'OKP key type (EdDSA/Ed25519) is not supported by Azure Key Vault. ' +
    'Supported algorithms are EC (ES256, ES384, ES512) and RSA (RS256, RS384, RS512, PS256, PS384, PS512).';
}
