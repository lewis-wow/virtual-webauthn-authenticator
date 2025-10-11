import { describe, test, expect } from 'vitest';
import type { Jwk } from '../../src/types.js';
import { getJwkAsymetricSigningAlg } from '../../src/getJwkAsymetricSigningAlg.js';
import { AsymetricSigningAlgorithm } from '@repo/enums';

describe('getJwkAsymetricSigningAlg', () => {
  test('should return the "alg" property if test is explicitly provided', () => {
    // This JWK would normally infer 'ES256', but 'alg' takes precedence.
    const jwk: Jwk = {
      kty: 'EC',
      crv: 'P-256',
      alg: AsymetricSigningAlgorithm.ES512,
    };
    expect(getJwkAsymetricSigningAlg(jwk)).toBe('ES512');
  });

  test('should return undefined for a JWK without sufficient information', () => {
    const jwk: Jwk = {
      kid: 'some-key-id',
    };
    expect(getJwkAsymetricSigningAlg(jwk)).toBeUndefined();
  });

  test('should throw a TypanionError if an invalid "alg" is provided', () => {
    const jwk: Jwk = {
      kty: 'RSA',
      alg: 'invalid-algorithm',
    };
    // The `assert` from `typanion` should throw an error here.
    expect(() => getJwkAsymetricSigningAlg(jwk)).toThrow();
  });

  describe('when kty is "RSA"', () => {
    test('should infer "PS256" for RSA keys', () => {
      const jwk: Jwk = {
        kty: 'RSA',
        n: '...',
        e: 'AQAB',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBe('PS256');
    });
  });

  describe('when kty is "EC"', () => {
    test('should infer "ES256" for curve P-256', () => {
      const jwk: Jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: '...',
        y: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBe('ES256');
    });

    test('should infer "ES384" for curve P-384', () => {
      const jwk: Jwk = {
        kty: 'EC',
        crv: 'P-384',
        x: '...',
        y: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBe('ES384');
    });

    test('should infer "ES512" for curve P-521', () => {
      const jwk: Jwk = {
        kty: 'EC',
        crv: 'P-521',
        x: '...',
        y: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBe('ES512');
    });

    test('should return undefined for curve secp256k1 as per current implementation', () => {
      // Note: While 'ES256K' is a valid algorithm for this curve,
      // the function's implementation explicitly returns undefined. This test validates that behavior.
      const jwk: Jwk = {
        kty: 'EC',
        crv: 'secp256k1',
        x: '...',
        y: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBeUndefined();
    });

    test('should return undefined for an unsupported EC curve', () => {
      const jwk: Jwk = {
        kty: 'EC',
        crv: 'brainpoolP256r1', // Unsupported curve
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBeUndefined();
    });
  });

  describe('when kty is "OKP"', () => {
    test('should infer "EdDSA" for curve Ed25519', () => {
      const jwk: Jwk = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBe('EdDSA');
    });

    test('should infer "EdDSA" for curve Ed448', () => {
      const jwk: Jwk = {
        kty: 'OKP',
        crv: 'Ed448',
        x: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBe('EdDSA');
    });

    test('should return undefined for an OKP curve not used for EdDSA signing (e.g., X25519)', () => {
      const jwk: Jwk = {
        kty: 'OKP',
        crv: 'X25519', // Used for key agreement, not signing
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBeUndefined();
    });
  });

  describe('when kty is unsupported', () => {
    test('should return undefined for a symmetric key type like "oct"', () => {
      const jwk: Jwk = {
        kty: 'oct',
        k: '...',
      };
      expect(getJwkAsymetricSigningAlg(jwk)).toBeUndefined();
    });
  });
});
