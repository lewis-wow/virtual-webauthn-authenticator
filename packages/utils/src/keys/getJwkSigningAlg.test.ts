import { describe, it, expect } from 'vitest';
import { getJwkSigningAlg } from './getJwkSigningAlg.js';
import { Buffer } from 'node:buffer';
import type { Jwk } from '../types.js';

describe('getJwkSigningAlg', () => {
  it('should return the "alg" property from the JWK if it exists, overriding other logic', () => {
    const jwk: Jwk = { kty: 'RSA', alg: 'RS256' };
    // Even though the default for RSA is PS256, the explicit 'alg' should be returned.
    expect(getJwkSigningAlg(jwk)).toBe('RS256');
  });

  describe('when kty is "EC"', () => {
    it('should return ES256 for curve P-256', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'P-256' };
      expect(getJwkSigningAlg(jwk)).toBe('ES256');
    });

    it('should return ES384 for curve P-384', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'P-384' };
      expect(getJwkSigningAlg(jwk)).toBe('ES384');
    });

    it('should return ES512 for curve P-521', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'P-521' };
      expect(getJwkSigningAlg(jwk)).toBe('ES512');
    });

    it('should return ES256K for curve secp256k1', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'secp256k1' };
      expect(getJwkSigningAlg(jwk)).toBe('ES256K');
    });

    it('should return EdDSA for curve Ed25519', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'Ed25519' };
      expect(getJwkSigningAlg(jwk)).toBe('EdDSA');
    });

    it('should return EdDSA for curve Ed448', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'Ed448' };
      expect(getJwkSigningAlg(jwk)).toBe('EdDSA');
    });

    it('should return undefined for a missing curve', () => {
      const jwk: Jwk = { kty: 'EC' };
      expect(getJwkSigningAlg(jwk)).toBeUndefined();
    });

    it('should return undefined for an unsupported curve', () => {
      const jwk: Jwk = { kty: 'EC', crv: 'brainpoolP256r1' };
      expect(getJwkSigningAlg(jwk)).toBeUndefined();
    });
  });

  describe('when kty is "RSA"', () => {
    it('should return "PS256" as the default signing algorithm', () => {
      const jwk: Jwk = { kty: 'RSA' };
      expect(getJwkSigningAlg(jwk)).toBe('PS256');
    });
  });

  describe('when kty is "oct"', () => {
    it('should return "HS256" for keys smaller than 384 bits', () => {
      // 256 bits / 32 bytes
      const key = Buffer.alloc(32).toString('base64url');
      const jwk: Jwk = { kty: 'oct', k: key };
      expect(getJwkSigningAlg(jwk)).toBe('HS256');
    });

    it('should return "HS384" for keys between 384 and 511 bits', () => {
      // 384 bits / 48 bytes
      const key = Buffer.alloc(48).toString('base64url');
      const jwk: Jwk = { kty: 'oct', k: key };
      expect(getJwkSigningAlg(jwk)).toBe('HS384');
    });

    it('should return "HS512" for keys of 512 bits or more', () => {
      // 512 bits / 64 bytes
      const key = Buffer.alloc(64).toString('base64url');
      const jwk: Jwk = { kty: 'oct', k: key };
      expect(getJwkSigningAlg(jwk)).toBe('HS512');
    });

    it('should return "HS512" for keys larger than 512 bits', () => {
      // 520 bits / 65 bytes
      const key = Buffer.alloc(65).toString('base64url');
      const jwk: Jwk = { kty: 'oct', k: key };
      expect(getJwkSigningAlg(jwk)).toBe('HS512');
    });

    it('should return "HS256" as a fallback if the "k" property is missing', () => {
      const jwk: Jwk = { kty: 'oct' };
      expect(getJwkSigningAlg(jwk)).toBe('HS256');
    });
  });

  describe('with edge cases and invalid inputs', () => {
    it('should return undefined for an unsupported kty', () => {
      // OKP (Octet Key Pair) is a valid JWK kty, but not supported by our function's logic.
      const jwk: Jwk = { kty: 'OKP', crv: 'X25519' };
      expect(getJwkSigningAlg(jwk)).toBeUndefined();
    });

    it('should return undefined for a missing kty', () => {
      const jwk: Jwk = { crv: 'P-256' };
      expect(getJwkSigningAlg(jwk)).toBeUndefined();
    });

    it('should return undefined for an empty JWK object', () => {
      const jwk: Jwk = {};
      expect(getJwkSigningAlg(jwk)).toBeUndefined();
    });
  });
});
