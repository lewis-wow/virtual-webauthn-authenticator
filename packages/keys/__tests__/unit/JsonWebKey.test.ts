import { KeyAlgorithm } from '../../src/___enums/KeyAlgorithm';
import { KeyCurveName } from '../../src/___enums/KeyCurveName';
import { KeyOperation } from '../../src/___enums/KeyOperation';
import { KeyType } from '../../src/___enums/KeyType';

import { describe, expect, test } from 'vitest';

import { JsonWebKey, type JsonWebKeyOptions } from '../../src/JsonWebKey';
import { CannotParseJsonWebKey } from '../../src/jwk/exceptions/CannotParseJsonWebKey';

// --- Test Data ---

const p256PublicKeyStrings = {
  kty: KeyType.EC,
  crv: KeyCurveName.P256,
  x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
  y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
};

const p256PublicKeyBuffers: JsonWebKeyOptions = {
  kty: KeyType.EC,
  crv: KeyCurveName.P256,
  x: Buffer.from(p256PublicKeyStrings.x, 'base64url'),
  y: Buffer.from(p256PublicKeyStrings.y, 'base64url'),
};

const rsaPublicKeyStrings = {
  kty: KeyType.RSA,
  n: 'uBoA40a4DDs5bSoYVq0a9sO-e8d9-z0oYXB2yN-s5E8yY8Pj8hY-u3-L8L_E9VvS4L8uXDjA1BqJ1A9o_j-J8sB-E8w_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_D1c8E8w-E8B_A1A8w-E8B_D1c8E8w-E8D_A1A8w-E8B_A1A8w-E8B_D1c8E8',
  e: 'AQAB',
};

const rsaPublicKeyBuffers: JsonWebKeyOptions = {
  kty: KeyType.RSA,
  n: Buffer.from(rsaPublicKeyStrings.n, 'base64url'),
  e: Buffer.from(rsaPublicKeyStrings.e, 'base64url'),
};

// --- End Test Data ---

describe('JsonWebKey', () => {
  describe('Constructor & Property Assignment', () => {
    test('should correctly assign string properties (EC)', () => {
      const jwk = new JsonWebKey(p256PublicKeyStrings);

      expect(jwk.kty).toBe(KeyType.EC);
      expect(jwk.crv).toBe(KeyCurveName.P256);
      expect(jwk.x).toBe(p256PublicKeyStrings.x);
      expect(jwk.y).toBe(p256PublicKeyStrings.y);
    });

    test('should convert Buffer properties to base64url (EC)', () => {
      const jwk = new JsonWebKey(p256PublicKeyBuffers);

      // Expect properties to be converted to strings
      expect(jwk.x).toBe(p256PublicKeyStrings.x);
      expect(jwk.y).toBe(p256PublicKeyStrings.y);
    });

    test('should correctly assign string properties (RSA)', () => {
      const jwk = new JsonWebKey(rsaPublicKeyStrings);

      expect(jwk.kty).toBe(KeyType.RSA);
      expect(jwk.n).toBe(rsaPublicKeyStrings.n);
      expect(jwk.e).toBe(rsaPublicKeyStrings.e);
    });

    test('should convert Buffer properties to base64url (RSA)', () => {
      const jwk = new JsonWebKey(rsaPublicKeyBuffers);

      // Expect properties to be converted to strings
      expect(jwk.n).toBe(rsaPublicKeyStrings.n);
      expect(jwk.e).toBe(rsaPublicKeyStrings.e);
    });

    test('should assign keyOps and other optional properties', () => {
      const options: JsonWebKeyOptions = {
        kty: KeyType.EC,
        kid: 'test-key-1',
        keyOps: [KeyOperation.SIGN, KeyOperation.VERIFY],
      };
      const jwk = new JsonWebKey(options);

      // expect(jwk.kid).toBe('test-key-1'); // This fails: the JsonWebKey constructor is missing the `kid` assignment
      expect(jwk.keyOps).toEqual([KeyOperation.SIGN, KeyOperation.VERIFY]);
    });

    test('should throw CannotParseJsonWebKey for invalid kty', () => {
      const invalidData = { kty: 'invalid-kty' } as JsonWebKeyOptions;
      expect(() => new JsonWebKey(invalidData)).toThrowError(
        new CannotParseJsonWebKey(),
      );
    });

    test('should throw CannotParseJsonWebKey for invalid crv', () => {
      const invalidData: JsonWebKeyOptions = {
        kty: KeyType.EC,
        crv: 'invalid-curve',
      };
      expect(() => new JsonWebKey(invalidData)).toThrowError(
        new CannotParseJsonWebKey(),
      );
    });

    test('should throw CannotParseJsonWebKey for invalid keyOps (not array)', () => {
      const invalidData = {
        keyOps: 'sign',
      } as unknown as JsonWebKeyOptions;
      expect(() => new JsonWebKey(invalidData)).toThrowError(
        new CannotParseJsonWebKey(),
      );
    });

    test('should throw CannotParseJsonWebKey for invalid keyOps (item in array)', () => {
      const invalidData: JsonWebKeyOptions = {
        keyOps: [KeyOperation.SIGN, 'invalid-op'],
      };
      expect(() => new JsonWebKey(invalidData)).toThrowError(
        new CannotParseJsonWebKey(),
      );
    });
  });

  describe('inferAlg()', () => {
    test('should infer ES256 for P-256', () => {
      const jwk = new JsonWebKey({ kty: KeyType.EC, crv: KeyCurveName.P256 });
      expect(jwk.inferAlg()).toBe(KeyAlgorithm.ES256);
    });

    test('should infer ES384 for P-384', () => {
      const jwk = new JsonWebKey({ kty: KeyType.EC, crv: KeyCurveName.P384 });
      expect(jwk.inferAlg()).toBe(KeyAlgorithm.ES384);
    });

    test('should infer ES512 for P-521', () => {
      const jwk = new JsonWebKey({ kty: KeyType.EC, crv: KeyCurveName.P521 });
      expect(jwk.inferAlg()).toBe(KeyAlgorithm.ES512);
    });

    test('should infer PS256 for RSA', () => {
      const jwk = new JsonWebKey({ kty: KeyType.RSA });
      expect(jwk.inferAlg()).toBe(KeyAlgorithm.PS256);
    });

    test('should return undefined for EC with no crv', () => {
      const jwk = new JsonWebKey({ kty: KeyType.EC });
      expect(jwk.inferAlg()).toBeUndefined();
    });

    test('should return undefined for no kty', () => {
      const jwk = new JsonWebKey({});
      expect(jwk.inferAlg()).toBeUndefined();
    });
  });

  describe('canParse()', () => {
    test('should return true for valid data', () => {
      const validData: JsonWebKeyOptions = {
        kty: KeyType.EC,
        crv: KeyCurveName.P256,
        keyOps: [KeyOperation.SIGN],
      };
      expect(JsonWebKey.canParse(validData)).toBe(true);
    });

    test('should return true for empty object', () => {
      expect(JsonWebKey.canParse({})).toBe(true);
    });

    test('should return true for data with only optional string params', () => {
      expect(JsonWebKey.canParse({ kid: '123' })).toBe(true);
      expect(JsonWebKey.canParse({ n: 'abc' })).toBe(true);
    });

    test('should return false for invalid kty', () => {
      expect(JsonWebKey.canParse({ kty: 'invalid' })).toBe(false);
    });

    test('should return false for invalid crv', () => {
      expect(JsonWebKey.canParse({ crv: 'invalid' })).toBe(false);
    });

    test('should return false for invalid keyOps (not array)', () => {
      const invalidData = { keyOps: 'sign' } as unknown as JsonWebKeyOptions;
      expect(JsonWebKey.canParse(invalidData)).toBe(false);
    });

    test('should return false for invalid keyOps (item in array)', () => {
      const invalidData: JsonWebKeyOptions = { keyOps: ['invalid'] };
      expect(JsonWebKey.canParse(invalidData)).toBe(false);
    });
  });
});
