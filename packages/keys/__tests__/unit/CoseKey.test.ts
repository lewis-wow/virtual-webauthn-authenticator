import type { Jwk } from '@repo/types';
import { interceptNodejsJwk } from '@repo/utils';
import { describe, expect, test } from 'vitest';

import { COSEKey } from '../../src/COSEKey.js';

describe('COSEKey', () => {
  describe('EC', () => {
    describe('P-256 round-trip', () => {
      const p256PublicKey: Jwk = interceptNodejsJwk({
        kty: 'EC',
        crv: 'P-256',
        x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
        y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
      });

      test('public key', () => {
        const coseKey = COSEKey.fromJwk(p256PublicKey);
        const outputJwk = coseKey.toJwk();

        // The output should contain all original properties
        expect(outputJwk).toMatchObject(p256PublicKey);
        // It should also have the inferred 'alg' property
        expect(outputJwk.alg).toBe('ES256');
      });

      test('private key', () => {
        const p256PrivateKey: Jwk = {
          ...p256PublicKey,
          d: 'RGs-NTMbC3S8EYM-LI_2a2yN2AnTpF2YAbK2DPa1fS4',
        };

        const coseKey = COSEKey.fromJwk(p256PrivateKey);
        const outputJwk = coseKey.toJwk();

        expect(outputJwk).toMatchObject(p256PrivateKey);
        expect(outputJwk.alg).toBe('ES256');
      });
    });

    describe('Ed25519 round-trip', () => {
      const ed25519PublicKey: Jwk = interceptNodejsJwk({
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'zdpL23z340A-vWQVZkAn9jS5WIxfeotI5b4L4x4j4VA',
      });

      test('public key', () => {
        const coseKey = COSEKey.fromJwk(ed25519PublicKey);
        const outputJwk = coseKey.toJwk();

        expect(outputJwk).toMatchObject(ed25519PublicKey);
        expect(outputJwk.alg).toBe('EdDSA');
      });
    });
  });

  describe('RSA', () => {
    // FIX: The original 'n' was an invalid base64url string (length 257). Corrected by removing the trailing 'w'.
    const rsaPublicKey: Jwk = interceptNodejsJwk({
      kty: 'RSA',
      n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8',
      e: 'AQAB',
    });

    test('round-trip public key', () => {
      const coseKey = COSEKey.fromJwk(rsaPublicKey);
      const outputJwk = coseKey.toJwk();

      expect(outputJwk).toMatchObject(rsaPublicKey);
      expect(outputJwk.alg).toBe('PS256');
    });
  });

  describe('Unsupported keys', () => {
    test('should throw for an EC key with a missing crv', () => {
      const jwk: Jwk = {
        kty: 'EC',
        x: 'x',
        y: 'y',
        alg: undefined as unknown as string,
      };
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });

    test('should throw for an RSA key with missing params', () => {
      // The assertion for jwk.n will fail inside the 'RSA' case.
      const jwk: Jwk = interceptNodejsJwk({ kty: 'RSA', e: 'AQAB' });
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });
  });
});
