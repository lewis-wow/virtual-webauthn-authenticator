import type { Exception } from '@repo/exception';

import { JoseAlgNotAllowedException } from '../../exceptions/jose/JoseAlgNotAllowedException';
import { JoseNotSupportedException } from '../../exceptions/jose/JoseNotSupportedException';
import { JweDecryptionFailedException } from '../../exceptions/jose/JweDecryptionFailedException';
import { JweInvalidException } from '../../exceptions/jose/JweInvalidException';
import { JwkInvalidException } from '../../exceptions/jose/JwkInvalidException';
import { JwksInvalidException } from '../../exceptions/jose/JwksInvalidException';
import { JwksMultipleMatchingKeysException } from '../../exceptions/jose/JwksMultipleMatchingKeysException';
import { JwksNoMatchingKeyException } from '../../exceptions/jose/JwksNoMatchingKeyException';
import { JwksTimeoutException } from '../../exceptions/jose/JwksTimeoutException';
import { JwsInvalidException } from '../../exceptions/jose/JwsInvalidException';
import { JwsSignatureVerificationFailedException } from '../../exceptions/jose/JwsSignatureVerificationFailedException';
import { JwtClaimValidationFailedException } from '../../exceptions/jose/JwtClaimValidationFailedException';
import { JwtExpiredException } from '../../exceptions/jose/JwtExpiredException';
import { JwtInvalidException } from '../../exceptions/jose/JwtInvalidException';

const JOSE_ERROR_MAP = {
  ERR_JWT_CLAIM_VALIDATION_FAILED: JwtClaimValidationFailedException,
  ERR_JWT_EXPIRED: JwtExpiredException,
  ERR_JOSE_ALG_NOT_ALLOWED: JoseAlgNotAllowedException,
  ERR_JOSE_NOT_SUPPORTED: JoseNotSupportedException,
  ERR_JWE_DECRYPTION_FAILED: JweDecryptionFailedException,
  ERR_JWE_INVALID: JweInvalidException,
  ERR_JWS_INVALID: JwsInvalidException,
  ERR_JWT_INVALID: JwtInvalidException,
  ERR_JWK_INVALID: JwkInvalidException,
  ERR_JWKS_INVALID: JwksInvalidException,
  ERR_JWKS_NO_MATCHING_KEY: JwksNoMatchingKeyException,
  ERR_JWKS_MULTIPLE_MATCHING_KEYS: JwksMultipleMatchingKeysException,
  ERR_JWKS_TIMEOUT: JwksTimeoutException,
  ERR_JWS_SIGNATURE_VERIFICATION_FAILED:
    JwsSignatureVerificationFailedException,
} as const;

/**
 * Maps a Jose library error to a custom JoseException
 * Returns undefined if the error code is not recognized
 */
export const mapJoseErrorToException = (
  error: unknown,
): Exception | undefined => {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code;

    if (!Object.hasOwn(JOSE_ERROR_MAP, code)) {
      return undefined;
    }

    const ExceptionClass = JOSE_ERROR_MAP[code as keyof typeof JOSE_ERROR_MAP];

    return new ExceptionClass({
      message: error.message,
      cause: error,
    });
  }

  return undefined;
};
