import { describe, expect, test } from 'vitest';

import { COSEKey } from '../../src/COSEKey.js';
import { JsonWebKey } from '../../src/JsonWebKey.js';

// KeyAlgorithm is no longer needed for these tests
// import { KeyAlgorithm } from '@repo/enums';

// --- Test Data ---

// Reusable JWK data objects (as plain objects).
// The COSEKey implementation expects strings, not buffers, for these values.
const p256PublicKeyData = {
  kty: 'EC',
  crv: 'P-256',
  x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
  y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
};

const p256PrivateKeyData = {
  ...p256PublicKeyData,
  d: 'RGs-NTMbC3S8EYM-LI_2a2yN2AnTpF2YAbK2DPa1fS4',
};

// The 'n' value from the user's test, which they noted was corrected.
const rsaPublicKeyData = {
  kty: 'RSA',
  // alg: 'RS256', // Removed, as JsonWebKey no longer handles 'alg'
  n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8',
  e: 'AQAB',
};

// A plausible (though not cryptographically matching) 'd' value for testing the private key path.
// Updated last character from _d to _c to match canonical round-trip output from test log.
const rsaPrivateKeyData = {
  ...rsaPublicKeyData,
  d: 'B-k_s-a_l-o-n-g_v-a-l-i-d_b-a-s-e-6-4-u-r-l_s-t-r-i-n-g_f-o-r_t-h-e_p-r-i-v-a-t-e_e-x-p-o-n-e-n-t_d_B-k_s-a_l-o-n-g_v-a-l-i-d_b-a-s-e-6-4-u-r-l_s-t-r-i-n-g_f-o-r_t-h-e_p-r-i-v-a-t-e_e-x-p-o-n-e-n-t_d_B-k_s-a_l-o-n-g_v-a-l-i-d_b-a-s-e-6-4-u-r-l_s-t-r-i-n-g_f-o-r_t-h-e_p-r-i-v-a-t-e_e-x-p-o-n-e-n-t_c',
};

// Reusable JsonWebKey class instances
const p256PublicKeyJwk = new JsonWebKey(p256PublicKeyData);
const p256PrivateKeyJwk = new JsonWebKey(p256PrivateKeyData);
const rsaPublicKeyJwk = new JsonWebKey(rsaPublicKeyData);
const rsaPrivateKeyJwk = new JsonWebKey(rsaPrivateKeyData);

// --- End Test Data ---

describe('COSEKey', () => {
  describe('JWK to COSE to JWK Round-trip', () => {
    describe('EC', () => {
      test('P-256 public key', () => {
        const coseKey = COSEKey.fromJwk(p256PublicKeyJwk);
        // `toJwk()` omits `alg`, so we compare against the original data, which also lacks 'alg'.
        const outputJwk = coseKey.toJwk();
        expect(outputJwk).toMatchObject(p256PublicKeyData);
      });

      test('P-256 private key', () => {
        const coseKey = COSEKey.fromJwk(p256PrivateKeyJwk);
        const outputJwk = coseKey.toJwk();
        expect(outputJwk).toMatchObject(p256PrivateKeyData);
      });
    });

    describe('RSA', () => {
      test('RSA public key', () => {
        const coseKey = COSEKey.fromJwk(rsaPublicKeyJwk);
        const outputJwk = coseKey.toJwk();

        // The 'alg' property is no longer part of the data or class.
        expect(outputJwk).toMatchObject(rsaPublicKeyData);
      });

      test('RSA private key', () => {
        const coseKey = COSEKey.fromJwk(rsaPrivateKeyJwk);
        const outputJwk = coseKey.toJwk();

        // The 'alg' property is no longer part of the data or class.
        expect(outputJwk).toMatchObject(rsaPrivateKeyData);
      });
    });
  });

  describe('CBOR Round-trip', () => {
    test('should serialize and deserialize a private key', () => {
      // 1. Create COSEKey from a known JWK
      const originalCoseKey = COSEKey.fromJwk(p256PrivateKeyJwk);

      // 2. Serialize to buffer
      const buffer = originalCoseKey.toBuffer();

      // 3. Deserialize from buffer
      const deserializedCoseKey = COSEKey.fromBuffer(buffer);

      // 4. Verify the internal map is identical
      expect(deserializedCoseKey.coseMap).toEqual(originalCoseKey.coseMap);

      // 5. Verify the deserialized key can be converted back to the original JWK
      const outputJwk = deserializedCoseKey.toJwk();
      expect(outputJwk).toMatchObject(p256PrivateKeyData);
    });
  });

  // This entire describe block is removed as the `keepAlg` option no longer exists.
  // describe('toJwk() options', () => { ... });

  describe('Unsupported keys / Error Handling', () => {
    test('should throw for an unsupported kty', () => {
      // Cast to unknown as JsonWebKey to bypass the JsonWebKey constructor's
      // validation, which was failing before COSEKey.fromJwk was called.
      const octJwk = {
        kty: 'oct', // This will cause jwk.inferAlg() to return undefined
        k: 'some-key',
      } as unknown as JsonWebKey;

      expect(() => COSEKey.fromJwk(octJwk)).toThrow();
    });

    test('should throw if alg cannot be inferred', () => {
      // Cast to unknown as JsonWebKey to bypass the JsonWebKey constructor's
      // validation on 'crv', allowing the test to fail inside COSEKey.fromJwk.
      const jwk = {
        kty: 'EC',
        crv: 'invalid-curve', // This will cause jwk.inferAlg() to return undefined
      } as unknown as JsonWebKey;
      // This fails the `assert(alg, isEnum(KeyAlgorithm))`
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });

    test('should throw for EC key with missing x', () => {
      const jwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        y: p256PublicKeyData.y,
      });
      // Fails `assert(jwk.x, isString())`
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });

    test('should throw for EC key with missing y', () => {
      const jwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: p256PublicKeyData.x,
      });
      // Fails `assert(jwk.y, isString())`
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });

    test('should throw for RSA key with missing n', () => {
      const jwk = new JsonWebKey({
        kty: 'RSA',
        e: rsaPublicKeyData.e,
        // alg: 'RS256', // Removed
      });
      // Fails `assert(jwk.n, isString())`
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });

    test('should throw for RSA key with missing e', () => {
      const jwk = new JsonWebKey({
        kty: 'RSA',
        n: rsaPublicKeyData.n,
        // alg: 'RS256', // Removed
      });
      // Fails `assert(jwk.e, isString())`
      expect(() => COSEKey.fromJwk(jwk)).toThrow();
    });
  });
});
