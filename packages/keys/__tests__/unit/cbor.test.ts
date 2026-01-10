import { describe, expect, test } from 'vitest';

import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyOKP,
  COSEPublicKeyRSA,
} from '../../src/COSEPublicKey.js';
import { decodeCOSEPublicKey } from '../../src/cbor/decodeCOSEPublicKey.js';
import { encodeCOSEPublicKey } from '../../src/cbor/encodeCOSEPublicKey.js';
import { COSEKeyCurveName } from '../../src/enums/COSEKeyCurveName.js';
import { COSEKeyParam } from '../../src/enums/COSEKeyParam.js';
import { COSEKeyType } from '../../src/enums/COSEKeyType.js';
import { COSEKeyTypeParam } from '../../src/enums/COSEKeyTypeParam.js';

// --- Test Data Helpers ---

/**
 * Helper function to create a COSE EC public key map
 */
const createECPublicKey = (): COSEPublicKeyEC => {
  const map = new Map() as COSEPublicKeyEC;
  map.set(COSEKeyParam.kty, COSEKeyType.EC);
  map.set(COSEKeyTypeParam.crv, COSEKeyCurveName['P-256']);
  map.set(COSEKeyTypeParam.x, new Uint8Array(32).fill(0x04));
  map.set(COSEKeyTypeParam.y, new Uint8Array(32).fill(0x05));
  return map;
};

/**
 * Helper function to create a COSE RSA public key map
 */
const createRSAPublicKey = (): COSEPublicKeyRSA => {
  const map = new Map() as COSEPublicKeyRSA;
  map.set(COSEKeyParam.kty, COSEKeyType.RSA);
  map.set(COSEKeyTypeParam.n, new Uint8Array(256).fill(0x01));
  map.set(COSEKeyTypeParam.e, new Uint8Array([0x01, 0x00, 0x01]));
  return map;
};

/**
 * Helper function to create a COSE OKP public key map
 */
const createOKPPublicKey = (): COSEPublicKeyOKP => {
  const map = new Map() as COSEPublicKeyOKP;
  map.set(COSEKeyParam.kty, COSEKeyType.OKP);
  map.set(COSEKeyTypeParam.crv, COSEKeyCurveName.Ed25519);
  map.set(COSEKeyTypeParam.x, new Uint8Array(32).fill(0x06));
  return map;
};

// --- End Test Data Helpers ---

describe('CBOR', () => {
  describe('encodeCOSEPublicKey', () => {
    test('should encode EC public key to CBOR bytes', () => {
      const coseKey = createECPublicKey();
      const encoded = encodeCOSEPublicKey(coseKey);

      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode RSA public key to CBOR bytes', () => {
      const coseKey = createRSAPublicKey();
      const encoded = encodeCOSEPublicKey(coseKey);

      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode OKP public key to CBOR bytes', () => {
      const coseKey = createOKPPublicKey();
      const encoded = encodeCOSEPublicKey(coseKey);

      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should produce consistent output for same input', () => {
      const coseKey = createECPublicKey();
      const encoded1 = encodeCOSEPublicKey(coseKey);
      const encoded2 = encodeCOSEPublicKey(coseKey);

      expect(encoded1).toEqual(encoded2);
    });
  });

  describe('decodeCOSEPublicKey', () => {
    test('should decode EC public key from CBOR bytes', () => {
      const originalKey = createECPublicKey();
      const encoded = encodeCOSEPublicKey(originalKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.get(COSEKeyParam.kty)).toBe(COSEKeyType.EC);
      expect((decoded as COSEPublicKeyEC).get(COSEKeyTypeParam.crv)).toBe(
        COSEKeyCurveName['P-256'],
      );
    });

    test('should decode RSA public key from CBOR bytes', () => {
      const originalKey = createRSAPublicKey();
      const encoded = encodeCOSEPublicKey(originalKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
    });

    test('should decode OKP public key from CBOR bytes', () => {
      const originalKey = createOKPPublicKey();
      const encoded = encodeCOSEPublicKey(originalKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.get(COSEKeyParam.kty)).toBe(COSEKeyType.OKP);
      expect((decoded as COSEPublicKeyOKP).get(COSEKeyTypeParam.crv)).toBe(
        COSEKeyCurveName.Ed25519,
      );
    });
  });

  describe('Round-trip encode/decode', () => {
    test('EC key should survive encode/decode round-trip', () => {
      const originalKey = createECPublicKey();
      const encoded = encodeCOSEPublicKey(originalKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.get(COSEKeyParam.kty)).toBe(
        originalKey.get(COSEKeyParam.kty),
      );
      expect((decoded as COSEPublicKeyEC).get(COSEKeyTypeParam.crv)).toBe(
        originalKey.get(COSEKeyTypeParam.crv),
      );
      expect((decoded as COSEPublicKeyEC).get(COSEKeyTypeParam.x)).toEqual(
        originalKey.get(COSEKeyTypeParam.x),
      );
      expect((decoded as COSEPublicKeyEC).get(COSEKeyTypeParam.y)).toEqual(
        originalKey.get(COSEKeyTypeParam.y),
      );
    });

    test('RSA key should survive encode/decode round-trip', () => {
      const originalKey = createRSAPublicKey();
      const encoded = encodeCOSEPublicKey(originalKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.get(COSEKeyParam.kty)).toBe(
        originalKey.get(COSEKeyParam.kty),
      );
      expect((decoded as COSEPublicKeyRSA).get(COSEKeyTypeParam.n)).toEqual(
        originalKey.get(COSEKeyTypeParam.n),
      );
      expect((decoded as COSEPublicKeyRSA).get(COSEKeyTypeParam.e)).toEqual(
        originalKey.get(COSEKeyTypeParam.e),
      );
    });

    test('OKP key should survive encode/decode round-trip', () => {
      const originalKey = createOKPPublicKey();
      const encoded = encodeCOSEPublicKey(originalKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.get(COSEKeyParam.kty)).toBe(
        originalKey.get(COSEKeyParam.kty),
      );
      expect((decoded as COSEPublicKeyOKP).get(COSEKeyTypeParam.crv)).toBe(
        originalKey.get(COSEKeyTypeParam.crv),
      );
      expect((decoded as COSEPublicKeyOKP).get(COSEKeyTypeParam.x)).toEqual(
        originalKey.get(COSEKeyTypeParam.x),
      );
    });
  });

  describe('Edge cases', () => {
    test('should handle empty Map', () => {
      const emptyMap = new Map() as COSEPublicKey;
      const encoded = encodeCOSEPublicKey(emptyMap);
      const decoded = decodeCOSEPublicKey(encoded);

      expect(decoded.size).toBe(0);
    });

    test('should preserve byte array contents exactly', () => {
      const xBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const yBytes = new Uint8Array([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

      const coseKey = new Map() as COSEPublicKeyEC;
      coseKey.set(COSEKeyParam.kty, COSEKeyType.EC);
      coseKey.set(COSEKeyTypeParam.crv, COSEKeyCurveName['P-256']);
      coseKey.set(COSEKeyTypeParam.x, xBytes);
      coseKey.set(COSEKeyTypeParam.y, yBytes);

      const encoded = encodeCOSEPublicKey(coseKey);
      const decoded = decodeCOSEPublicKey(encoded);

      expect((decoded as COSEPublicKeyEC).get(COSEKeyTypeParam.x)).toEqual(
        xBytes,
      );
      expect((decoded as COSEPublicKeyEC).get(COSEKeyTypeParam.y)).toEqual(
        yBytes,
      );
    });
  });
});
