import { describe, expect, test } from 'vitest';

import { JsonWebKey } from '../../src/JsonWebKey.js';
import { COSEKeyMapper } from '../../src/mappers/KeyMapper.js';

// --- Test Data ---

// Reusable JWK data objects (as plain objects).
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

const rsaPublicKeyData = {
  kty: 'RSA',
  n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8',
  e: 'AQAB',
};

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

describe('COSEKeyMapper', () => {
  describe('JWK to COSE to JWK Round-trip', () => {
    describe('EC', () => {
      test('P-256 public key', () => {
        const coseKey = COSEKeyMapper.jwkToCOSEKey(p256PublicKeyJwk);
        const outputJwk = COSEKeyMapper.COSEKeyToJwk(coseKey);
        expect(outputJwk).toMatchObject(p256PublicKeyData);
      });

      test('P-256 private key', () => {
        const coseKey = COSEKeyMapper.jwkToCOSEKey(p256PrivateKeyJwk);
        const outputJwk = COSEKeyMapper.COSEKeyToJwk(coseKey);
        expect(outputJwk).toMatchObject(p256PrivateKeyData);
      });
    });

    describe('RSA', () => {
      test('RSA public key', () => {
        const coseKey = COSEKeyMapper.jwkToCOSEKey(rsaPublicKeyJwk);
        const outputJwk = COSEKeyMapper.COSEKeyToJwk(coseKey);
        expect(outputJwk).toMatchObject(rsaPublicKeyData);
      });

      test('RSA private key', () => {
        const coseKey = COSEKeyMapper.jwkToCOSEKey(rsaPrivateKeyJwk);
        const outputJwk = COSEKeyMapper.COSEKeyToJwk(coseKey);
        expect(outputJwk).toMatchObject(rsaPrivateKeyData);
      });
    });
  });

  describe('CBOR Round-trip', () => {
    test('should serialize and deserialize a private key', () => {
      // 1. Create COSEKey from a known JWK
      const originalCoseKey = COSEKeyMapper.jwkToCOSEKey(p256PrivateKeyJwk);

      // 2. Serialize to buffer
      const buffer = COSEKeyMapper.COSEKeyToBytes(originalCoseKey);

      // 3. Deserialize from buffer
      const deserializedCoseKey = COSEKeyMapper.bytesToCOSEKey(buffer);

      // 4. Verify the internal map is identical
      expect(deserializedCoseKey.map).toEqual(originalCoseKey.map);

      // 5. Verify the deserialized key can be converted back to the original JWK
      const outputJwk = COSEKeyMapper.COSEKeyToJwk(deserializedCoseKey);
      expect(outputJwk).toMatchObject(p256PrivateKeyData);
    });
  });

  describe('Unsupported keys / Error Handling', () => {
    test('should throw for an unsupported kty', () => {
      const octJwk = {
        kty: 'oct',
        k: 'some-key',
      } as unknown as JsonWebKey;

      expect(() => COSEKeyMapper.jwkToCOSEKey(octJwk)).toThrow();
    });

    test('should throw if alg cannot be inferred', () => {
      const jwk = {
        kty: 'EC',
        crv: 'invalid-curve',
      } as unknown as JsonWebKey;
      expect(() => COSEKeyMapper.jwkToCOSEKey(jwk)).toThrow();
    });

    test('should throw for EC key with missing x', () => {
      const jwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        y: p256PublicKeyData.y,
      });
      expect(() => COSEKeyMapper.jwkToCOSEKey(jwk)).toThrow();
    });

    test('should throw for EC key with missing y', () => {
      const jwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: p256PublicKeyData.x,
      });
      expect(() => COSEKeyMapper.jwkToCOSEKey(jwk)).toThrow();
    });

    test('should throw for RSA key with missing n', () => {
      const jwk = new JsonWebKey({
        kty: 'RSA',
        e: rsaPublicKeyData.e,
      });
      expect(() => COSEKeyMapper.jwkToCOSEKey(jwk)).toThrow();
    });

    test('should throw for RSA key with missing e', () => {
      const jwk = new JsonWebKey({
        kty: 'RSA',
        n: rsaPublicKeyData.n,
      });
      expect(() => COSEKeyMapper.jwkToCOSEKey(jwk)).toThrow();
    });
  });
});
