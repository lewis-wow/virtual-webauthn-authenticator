import * as cbor from '@repo/cbor';
import type { COSEPublicKey, COSEPublicKeyEC } from '@repo/keys';
import {
  COSEKeyAlgorithm,
  COSEKeyCurveName,
  COSEKeyParam,
  COSEKeyType,
  COSEKeyTypeParam,
} from '@repo/keys/enums';
import type { Uint8Array_ } from '@repo/types';
import { describe, expect, test } from 'vitest';

import { AuthenticatorAttestationResponseImpl } from '../../../src/browser/AuthenticatorAttestationResponseImpl.js';
import { AuthenticatorTransport } from '../../../src/enums/index.js';
import { AlgorithmIdentifierNotFoundInCoseKey } from '../../../src/exceptions/index.js';

// --- Test Data Helpers ---

/**
 * Helper function to create a COSE EC public key map
 */
const createECPublicKey = (includeAlg = true): COSEPublicKey => {
  const map = new Map() as COSEPublicKeyEC;
  map.set(COSEKeyParam.kty, COSEKeyType.EC);
  if (includeAlg) {
    map.set(COSEKeyParam.alg, COSEKeyAlgorithm.ES256);
  }
  map.set(COSEKeyTypeParam.crv, COSEKeyCurveName['P-256']);
  map.set(COSEKeyTypeParam.x, new Uint8Array(32).fill(0x04));
  map.set(COSEKeyTypeParam.y, new Uint8Array(32).fill(0x05));
  return map;
};

/**
 * Helper function to create authenticator data with attested credential data
 */
const createAuthData = (options: {
  rpIdHash?: Uint8Array_;
  flags?: number;
  counter?: number;
  aaguid?: Uint8Array_;
  credentialId?: Uint8Array_;
  publicKey?: COSEPublicKey;
}): Uint8Array_ => {
  const {
    rpIdHash = new Uint8Array(32).fill(0x01),
    flags = 0b01000001, // UP + AT bits set
    counter = 0,
    aaguid = new Uint8Array(16).fill(0x02),
    credentialId = new Uint8Array([0x03, 0x04, 0x05]),
    publicKey = createECPublicKey(),
  } = options;

  const parts: Uint8Array_[] = [];

  // [RPIDHash (32)]
  parts.push(rpIdHash);

  // [Flags (1)]
  parts.push(new Uint8Array([flags]));

  // [Counter (4)]
  const counterBuffer = new Uint8Array(4);
  new DataView(counterBuffer.buffer).setUint32(0, counter, false);
  parts.push(counterBuffer);

  // [AAGUID (16)]
  parts.push(aaguid);

  // [Credential ID length (2)]
  const credIdLengthBuffer = new Uint8Array(2);
  new DataView(credIdLengthBuffer.buffer).setUint16(
    0,
    credentialId.length,
    false,
  );
  parts.push(credIdLengthBuffer);

  // [Credential ID (L)]
  parts.push(credentialId);

  // [Credential public key (Variable length)] - COSE Key
  parts.push(cbor.encode(publicKey));

  // Concatenate all parts
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
};

/**
 * Helper function to create a valid attestation object
 */
const createAttestationObject = (authData?: Uint8Array_): ArrayBuffer => {
  const attestationObject = new Map<string, unknown>();
  attestationObject.set('fmt', 'none');
  attestationObject.set('authData', authData ?? createAuthData({}));
  attestationObject.set('attStmt', {});

  const encoded = cbor.encode(attestationObject);
  return encoded.buffer.slice(
    encoded.byteOffset,
    encoded.byteOffset + encoded.byteLength,
  );
};

// --- End Test Data Helpers ---

describe('AuthenticatorAttestationResponseImpl', () => {
  const createMockOptions = () => ({
    clientDataJSON: new TextEncoder().encode('{"test":"data"}')
      .buffer as ArrayBuffer,
    attestationObject: createAttestationObject(),
    transports: [AuthenticatorTransport.USB, AuthenticatorTransport.NFC],
  });

  describe('constructor', () => {
    test('should create instance with all required properties', () => {
      const opts = createMockOptions();

      const response = new AuthenticatorAttestationResponseImpl(opts);

      expect(response.clientDataJSON).toBe(opts.clientDataJSON);
      expect(response.attestationObject).toBe(opts.attestationObject);
      expect(response.transports).toEqual(opts.transports);
    });

    test('should handle empty transports array', () => {
      const opts = {
        ...createMockOptions(),
        transports: [],
      };

      const response = new AuthenticatorAttestationResponseImpl(opts);

      expect(response.transports).toEqual([]);
    });
  });

  describe('getAuthenticatorData', () => {
    test('should return authenticator data from attestation object', () => {
      const authData = createAuthData({});
      const opts = {
        ...createMockOptions(),
        attestationObject: createAttestationObject(authData),
      };

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const result = response.getAuthenticatorData();

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(authData.byteLength);
    });

    test('should return consistent data on subsequent calls', () => {
      const opts = createMockOptions();

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const first = response.getAuthenticatorData();
      const second = response.getAuthenticatorData();

      // The returned ArrayBuffers may be different instances,
      // but should contain the same data
      expect(new Uint8Array(first)).toEqual(new Uint8Array(second));
    });
  });

  describe('getPublicKey', () => {
    test('should return public key from authenticator data', () => {
      const opts = createMockOptions();

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const publicKey = response.getPublicKey();

      expect(publicKey).toBeInstanceOf(ArrayBuffer);
      expect(publicKey!.byteLength).toBeGreaterThan(0);
    });

    test('should cache public key on subsequent calls', () => {
      const opts = createMockOptions();

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const first = response.getPublicKey();
      const second = response.getPublicKey();

      expect(first).toBe(second);
    });

    test('should return null when no credential public key in authenticator data', () => {
      // Create authData without attested credential data (only UP bit, no AT bit)
      const minimalAuthData = new Uint8Array(37);
      minimalAuthData.fill(0x01, 0, 32); // rpIdHash
      minimalAuthData[32] = 0b00000001; // flags: only UP
      // counter is 0 (bytes 33-36)

      const attestationObject = new Map<string, unknown>();
      attestationObject.set('fmt', 'none');
      attestationObject.set('authData', minimalAuthData);
      attestationObject.set('attStmt', {});

      const encoded = cbor.encode(attestationObject);
      const opts = {
        clientDataJSON: new ArrayBuffer(16),
        attestationObject: encoded.buffer.slice(
          encoded.byteOffset,
          encoded.byteOffset + encoded.byteLength,
        ),
        transports: [] as AuthenticatorTransport[],
      };

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const publicKey = response.getPublicKey();

      expect(publicKey).toBeNull();
    });
  });

  describe('getPublicKeyAlgorithm', () => {
    test('should return COSE algorithm identifier', () => {
      const opts = createMockOptions();

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const algorithm = response.getPublicKeyAlgorithm();

      expect(algorithm).toBe(COSEKeyAlgorithm.ES256);
    });

    test('should throw when algorithm identifier not found', () => {
      const publicKeyWithoutAlg = createECPublicKey(false);
      const authData = createAuthData({ publicKey: publicKeyWithoutAlg });
      const opts = {
        ...createMockOptions(),
        attestationObject: createAttestationObject(authData),
      };

      const response = new AuthenticatorAttestationResponseImpl(opts);

      expect(() => response.getPublicKeyAlgorithm()).toThrow(
        AlgorithmIdentifierNotFoundInCoseKey,
      );
    });
  });

  describe('getTransports', () => {
    test('should return transports array', () => {
      const opts = createMockOptions();

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const transports = response.getTransports();

      expect(transports).toEqual([
        AuthenticatorTransport.USB,
        AuthenticatorTransport.NFC,
      ]);
    });

    test('should return empty array when no transports', () => {
      const opts = {
        ...createMockOptions(),
        transports: [],
      };

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const transports = response.getTransports();

      expect(transports).toEqual([]);
    });

    test('should return all transport types', () => {
      const allTransports = [
        AuthenticatorTransport.USB,
        AuthenticatorTransport.NFC,
        AuthenticatorTransport.BLE,
        AuthenticatorTransport.INTERNAL,
        AuthenticatorTransport.HYBRID,
      ];
      const opts = {
        ...createMockOptions(),
        transports: allTransports,
      };

      const response = new AuthenticatorAttestationResponseImpl(opts);
      const transports = response.getTransports();

      expect(transports).toEqual(allTransports);
    });
  });
});
