import { describe, test, expect } from 'vitest';
import type { Jwk } from './types.js';
import { CoseKey } from './CoseKey.js';

describe('CoseKey', () => {
  describe('EC', () => {
    describe('P-256 round-trip', () => {
      const p256PublicKey = {
        kty: 'EC',
        crv: 'P-256',
        x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
        y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
      };

      test('public key', () => {
        const coseKey = CoseKey.fromJwk(p256PublicKey);
        expect(coseKey.toJwk()).toMatchObject(p256PublicKey);
      });

      test('private key', () => {
        const p256PrivateKey: Jwk = {
          ...p256PublicKey,
          d: 'RGs-NTMbC3S8EYM-LI_2a2yN2AnTpF2YAbK2DPa1fS4',
        };

        const coseKey = CoseKey.fromJwk(p256PrivateKey);
        expect(coseKey.toJwk()).toMatchObject(p256PrivateKey);
      });
    });

    describe('Ed25519 round-trip', () => {
      const ed25519PublicKey: Jwk = {
        kty: 'OKP', // `cose-to-jwk` uses OKP for EdDSA, so we match it
        crv: 'Ed25519',
        x: 'zdpL23z340A-vWQVZkAn9jS5WIxfeotI5b4L4x4j4VA',
      };

      test('public key', () => {
        const coseKey = CoseKey.fromJwk(ed25519PublicKey);
        expect(coseKey.toJwk()).toMatchObject(ed25519PublicKey);
      });
    });
  });

  describe('RSA', () => {
    const rsaPublicKey: Jwk = {
      kty: 'RSA',
      n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w',
      e: 'AQAB',
    };

    test('round-trip public key', () => {
      const coseKey = CoseKey.fromJwk(rsaPublicKey);
      expect(coseKey.toJwk()).toMatchObject(rsaPublicKey);
    });
  });

  describe('Symmetric oct', () => {
    const key: Jwk = {
      kty: 'oct',
      k: 'Vlaj4r4n-22t3s5xGfpPlQh5z2ZAbG-ci554zYy_GzI',
    };

    test('round-trip key', () => {
      const coseKey = CoseKey.fromJwk(key);
      expect(coseKey.toJwk()).toMatchObject(key);
    });
  });

  describe('Unsupported keys', () => {
    test('should return undefined for a key with an unsupported algorithm', () => {
      // Our function does not have a COSE mapping for RS512
      const jwk: Jwk = { kty: 'RSA', alg: 'RS512', n: 'n', e: 'e' };
      expect(() => CoseKey.fromJwk(jwk)).toThrow();
    });

    test('should return undefined for an EC key with a missing crv', () => {
      const jwk: Jwk = { kty: 'EC', x: 'x', y: 'y' };
      expect(() => CoseKey.fromJwk(jwk)).toThrow();
    });

    test('should return undefined for an RSA key with missing params', () => {
      const jwk: Jwk = { kty: 'RSA', e: 'AQAB' };
      expect(() => CoseKey.fromJwk(jwk)).toThrow();
    });
  });
});
