import * as jose from 'jose';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  JwtExpiredException,
  JwtInvalidException,
  JwsSignatureVerificationFailedException,
} from '../../src/exceptions/jose/index';
import { Jwt } from '../../src/jwt/Jwt';

// Mock jose
vi.mock('jose', async (importOriginal) => {
  const actual = await importOriginal<typeof jose>();
  return {
    ...actual,
    jwtVerify: vi.fn(),
    createLocalJWKSet: vi.fn(),
  };
});

describe('Jwt', () => {
  const mockJwtVerify = vi.mocked(jose.jwtVerify);

  // Mock dependencies
  const mockJwks = {
    getJSONWebKeySet: vi.fn(),
    getLatestPrivateKeyOrGenerate: vi.fn(),
  } as any;

  it('should throw JwtExpiredException when jose throws ERR_JWT_EXPIRED', async () => {
    const error = new Error('Expired');
    (error as any).code = 'ERR_JWT_EXPIRED';
    mockJwtVerify.mockRejectedValue(error);

    await expect(
      Jwt.validateToken('token', z.any(), { jwks: mockJwks }),
    ).rejects.toThrow(JwtExpiredException);
  });

  it('should throw JwtInvalidException when jose throws ERR_JWT_INVALID', async () => {
    const error = new Error('Invalid');
    (error as any).code = 'ERR_JWT_INVALID';
    mockJwtVerify.mockRejectedValue(error);

    await expect(
      Jwt.validateToken('token', z.any(), { jwks: mockJwks }),
    ).rejects.toThrow(JwtInvalidException);
  });

  it('should throw JwsSignatureVerificationFailedException when jose throws ERR_JWS_SIGNATURE_VERIFICATION_FAILED', async () => {
    const error = new Error('Sig failed');
    (error as any).code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    mockJwtVerify.mockRejectedValue(error);

    await expect(
      Jwt.validateToken('token', z.any(), { jwks: mockJwks }),
    ).rejects.toThrow(JwsSignatureVerificationFailedException);
  });

  it('should rethrow unknown errors', async () => {
    const error = new Error('Unknown');
    (error as any).code = 'UNKNOWN_CODE';
    mockJwtVerify.mockRejectedValue(error);

    await expect(
      Jwt.validateToken('token', z.any(), { jwks: mockJwks }),
    ).rejects.toThrow('Unknown');
  });
});
