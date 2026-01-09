import { describe, expect, test } from 'vitest';

import { COSEKey } from '../../src/cose/COSEKey';
import { JsonWebKey } from '../../src/jwk/JsonWebKey';
import { KeyMapper } from '../../src/shared/mappers/KeyMapper';

// --- Test Data ---

// Reusable JWK data objects (as plain objects).
// Note: This package only supports public keys, not private keys.

const p256PublicKeyData = {
  kty: 'EC',
  crv: 'P-256',
  x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
  y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
};

const rsaPublicKeyData = {
  kty: 'RSA',
  n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8',
  e: 'AQAB',
};

const ed25519PublicKeyData = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'XuEoF6K1cPOKyFJSN2vQqZg1H45-wMEpK7YbYfSxLW8',
};

// Reusable JsonWebKey class instances
const p256PublicKeyJwk = new JsonWebKey(p256PublicKeyData);
const rsaPublicKeyJwk = new JsonWebKey(rsaPublicKeyData);
const ed25519PublicKeyJwk = new JsonWebKey(ed25519PublicKeyData);

// --- End Test Data ---

describe('KeyMapper', () => {
  describe('JWK to COSE to JWK Round-trip', () => {
    describe('EC', () => {
      test('P-256 public key', () => {
        const coseKey = KeyMapper.JWKToCOSE(p256PublicKeyJwk);
        const outputJwk = KeyMapper.COSEToJWK(coseKey);
        expect(outputJwk).toMatchObject(p256PublicKeyData);
      });
    });

    describe('RSA', () => {
      test('RSA public key', () => {
        const coseKey = KeyMapper.JWKToCOSE(rsaPublicKeyJwk);
        const outputJwk = KeyMapper.COSEToJWK(coseKey);
        expect(outputJwk).toMatchObject(rsaPublicKeyData);
      });
    });

    describe('OKP', () => {
      test('Ed25519 public key', () => {
        const coseKey = KeyMapper.JWKToCOSE(ed25519PublicKeyJwk);
        const outputJwk = KeyMapper.COSEToJWK(coseKey);
        expect(outputJwk).toMatchObject(ed25519PublicKeyData);
      });
    });
  });

  describe('CBOR Round-trip', () => {
    test('should serialize and deserialize an EC public key', () => {
      // 1. Create COSEKey from a known JWK
      const originalCoseKey = KeyMapper.JWKToCOSE(p256PublicKeyJwk);

      // 2. Serialize to buffer
      const buffer = originalCoseKey.toBytes();

      // 3. Deserialize from buffer
      const deserializedCoseKey = COSEKey.fromBytes(buffer);

      // 4. Verify the internal map is identical
      expect(deserializedCoseKey.map).toEqual(originalCoseKey.map);

      // 5. Verify the deserialized key can be converted back to the original JWK
      const outputJwk = KeyMapper.COSEToJWK(deserializedCoseKey);
      expect(outputJwk).toMatchObject(p256PublicKeyData);
    });

    test('should serialize and deserialize an OKP public key', () => {
      // 1. Create COSEKey from a known JWK
      const originalCoseKey = KeyMapper.JWKToCOSE(ed25519PublicKeyJwk);

      // 2. Serialize to buffer
      const buffer = originalCoseKey.toBytes();

      // 3. Deserialize from buffer
      const deserializedCoseKey = COSEKey.fromBytes(buffer);

      // 4. Verify the internal map is identical
      expect(deserializedCoseKey.map).toEqual(originalCoseKey.map);

      // 5. Verify the deserialized key can be converted back to the original JWK
      const outputJwk = KeyMapper.COSEToJWK(deserializedCoseKey);
      expect(outputJwk).toMatchObject(ed25519PublicKeyData);
    });
  });

  describe('Unsupported keys / Error Handling', () => {
    test('should throw for an unsupported kty', () => {
      const octJwk = {
        kty: 'oct',
        k: 'some-key',
      } as unknown as JsonWebKey;

      expect(() => KeyMapper.JWKToCOSE(octJwk)).toThrow();
    });

    test('should throw if alg cannot be inferred', () => {
      const jwk = {
        kty: 'EC',
        crv: 'invalid-curve',
      } as unknown as JsonWebKey;
      expect(() => KeyMapper.JWKToCOSE(jwk)).toThrow();
    });

    test('should throw for EC key with missing x', () => {
      const jwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        y: p256PublicKeyData.y,
      });
      expect(() => KeyMapper.JWKToCOSE(jwk)).toThrow();
    });

    test('should throw for EC key with missing y', () => {
      const jwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: p256PublicKeyData.x,
      });
      expect(() => KeyMapper.JWKToCOSE(jwk)).toThrow();
    });

    test('should throw for RSA key with missing n', () => {
      const jwk = new JsonWebKey({
        kty: 'RSA',
        e: rsaPublicKeyData.e,
      });
      expect(() => KeyMapper.JWKToCOSE(jwk)).toThrow();
    });

    test('should throw for RSA key with missing e', () => {
      const jwk = new JsonWebKey({
        kty: 'RSA',
        n: rsaPublicKeyData.n,
      });
      expect(() => KeyMapper.JWKToCOSE(jwk)).toThrow();
    });

    test('should throw for OKP key with missing x', () => {
      const jwk = new JsonWebKey({
        kty: 'OKP',
        crv: 'Ed25519',
      });
      expect(() => KeyMapper.JWKToCOSE(jwk)).toThrow();
    });
  });
});
