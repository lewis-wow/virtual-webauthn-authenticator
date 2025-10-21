import { describe, expect, test } from 'vitest';

import { COSEKey } from '../../src/COSEKey.js';
import { JsonWebKey } from '../../src/JsonWebKey.js';

describe('COSEKey', () => {
  describe('EC', () => {
    describe('P-256 round-trip', () => {
      const p256PublicKey = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: Buffer.from(
          '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
          'base64url',
        ),
        y: Buffer.from(
          'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
          'base64url',
        ),
      });

      test('public key', () => {
        const coseKey = COSEKey.fromJwk(p256PublicKey);
        const outputJwk = coseKey.toJwk();

        expect(outputJwk).toMatchObject(p256PublicKey);
      });

      test('private key', () => {
        const p256PrivateKey = new JsonWebKey({
          ...p256PublicKey,
          d: Buffer.from(
            'RGs-NTMbC3S8EYM-LI_2a2yN2AnTpF2YAbK2DPa1fS4',
            'base64url',
          ),
        });

        const coseKey = COSEKey.fromJwk(p256PrivateKey);
        const outputJwk = coseKey.toJwk();

        expect(outputJwk).toMatchObject(p256PrivateKey);
      });
    });
  });

  describe('RSA', () => {
    // FIX: The original 'n' was an invalid base64url string (length 257). Corrected by removing the trailing 'w'.
    const rsaPublicKey = new JsonWebKey({
      kty: 'RSA',
      n: Buffer.from(
        'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8',
        'base64url',
      ),
      e: Buffer.from('AQAB', 'base64url'),
    });

    test('round-trip public key', () => {
      const coseKey = COSEKey.fromJwk(rsaPublicKey);
      const outputJwk = coseKey.toJwk();

      expect(outputJwk).toEqual(rsaPublicKey);
    });
  });

  describe('Unsupported keys', () => {
    test('should throw for an EC key with a missing crv', () => {
      const jwk = {
        kty: 'EC',
        x: Buffer.from('x'),
        y: Buffer.from('y'),
      } as unknown as JsonWebKey;

      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });

    test('should throw for an RSA key with missing params', () => {
      // The assertion for jwk.n will fail inside the 'RSA' case.
      const jwk = new JsonWebKey({
        kty: 'RSA',
        e: Buffer.from('AQAB', 'base64url'),
      });
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });
  });
});
