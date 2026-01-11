import * as cbor from '@repo/cbor';
import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyRSA,
} from '@repo/keys';
import {
  COSEKeyCurveName,
  COSEKeyParam,
  COSEKeyType,
  COSEKeyTypeParam,
} from '@repo/keys/enums';
import type { Uint8Array_ } from '@repo/types';
import { describe, expect, test } from 'vitest';

import { parseAuthenticatorData } from '../../src/cbor/parseAuthenticatorData.js';

// --- Test Data ---

/**
 * Helper function to create a COSE EC public key map
 */
const createECPublicKey = (): COSEPublicKey => {
  const map = new Map() as COSEPublicKeyEC;
  map.set(COSEKeyParam.kty, COSEKeyType.EC);
  map.set(COSEKeyTypeParam.crv, 1); // P-256
  map.set(COSEKeyTypeParam.x, new Uint8Array(32).fill(0x04));
  map.set(COSEKeyTypeParam.y, new Uint8Array(32).fill(0x05));
  return map;
};

/**
 * Helper function to create a COSE RSA public key map
 */
const createRSAPublicKey = (): COSEPublicKey => {
  const map = new Map() as COSEPublicKeyRSA;
  map.set(COSEKeyParam.kty, COSEKeyType.RSA);
  map.set(COSEKeyTypeParam.n, new Uint8Array(256).fill(0x01));
  map.set(COSEKeyTypeParam.e, new Uint8Array([0x01, 0x00, 0x01])); // 65537
  return map;
};

/**
 * Helper function to create a valid authenticator data buffer
 */
const createAuthData = (options: {
  rpIdHash?: Uint8Array_;
  flags?: number;
  counter?: number;
  includeAttestedCredentialData?: boolean;
  includeExtensions?: boolean;
  aaguid?: Uint8Array_;
  credentialId?: Uint8Array_;
  publicKey?: COSEPublicKey;
  extensions?: Record<string, unknown>;
}): Uint8Array_ => {
  const {
    rpIdHash = new Uint8Array(32).fill(0x01), // Default 32-byte hash
    flags = 0b00000001, // Default: only UP (User Present) bit set
    counter = 0,
    includeAttestedCredentialData = false,
    includeExtensions = false,
    aaguid = new Uint8Array(16).fill(0x02),
    credentialId = new Uint8Array([0x03, 0x04, 0x05]),
    publicKey = createECPublicKey(),
    extensions = { example: 'value' },
  } = options;

  const parts: Uint8Array_[] = [];

  // [RPIDHash (32)]
  parts.push(rpIdHash);

  // [Flags (1)]
  let finalFlags = flags;
  if (includeAttestedCredentialData) {
    finalFlags |= 0b01000000; // Set AT bit (bit 6)
  }
  if (includeExtensions) {
    finalFlags |= 0b10000000; // Set ED bit (bit 7)
  }
  parts.push(new Uint8Array([finalFlags]));

  // [Counter (4)]
  const counterBuffer = new Uint8Array(4);
  new DataView(counterBuffer.buffer).setUint32(0, counter, false);
  parts.push(counterBuffer);

  // [Attested credential data] - if included
  if (includeAttestedCredentialData) {
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
  }

  // [Extensions] - if included
  if (includeExtensions) {
    parts.push(cbor.encode(extensions));
  }

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

// --- End Test Data ---

describe('parseAuthenticatorData', () => {
  describe('Validation', () => {
    test('should parse valid minimal authData', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result).toBeDefined();
      expect(result.rpIdHash).toBeInstanceOf(Uint8Array);
      expect(result.flags).toBeDefined();
      expect(typeof result.counter).toBe('number');
    });

    test('should throw on authData too short (missing counter)', () => {
      const invalidAuthData = new Uint8Array(36); // 32 (hash) + 1 (flags) + 3 (incomplete counter)

      expect(() => parseAuthenticatorData(invalidAuthData)).toThrow(
        'Authenticator data was 36 bytes, expected at least 37 bytes',
      );
    });

    test('should throw on authData too short (only hash)', () => {
      const invalidAuthData = new Uint8Array(32); // Only hash

      expect(() => parseAuthenticatorData(invalidAuthData)).toThrow(
        'Authenticator data was 32 bytes, expected at least 37 bytes',
      );
    });

    test('should throw on empty authData', () => {
      const invalidAuthData = new Uint8Array(0);

      expect(() => parseAuthenticatorData(invalidAuthData)).toThrow(
        'Authenticator data was 0 bytes, expected at least 37 bytes',
      );
    });
  });

  describe('rpIdHash parsing', () => {
    test('should parse rpIdHash correctly', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result.rpIdHash).toBeInstanceOf(Uint8Array);
      expect(result.rpIdHash.length).toBe(32);
      expect(result.rpIdHash).toEqual(new Uint8Array(32).fill(0x01));
    });

    test('should parse custom rpIdHash correctly', () => {
      const customHash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        customHash[i] = i;
      }

      const authData = createAuthData({ rpIdHash: customHash });
      const result = parseAuthenticatorData(authData);

      expect(result.rpIdHash).toEqual(customHash);
    });
  });

  describe('flags parsing', () => {
    test('should parse default flags correctly', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result.flags.flagsInt).toBe(0b00000001); // Only UP bit
      expect(result.flags.up).toBe(true);
      expect(result.flags.uv).toBe(false);
      expect(result.flags.be).toBe(false);
      expect(result.flags.bs).toBe(false);
      expect(result.flags.at).toBe(false);
      expect(result.flags.ed).toBe(false);
    });

    test('should parse flagsBuf correctly', () => {
      const authData = createAuthData({ flags: 0b00000101 });
      const result = parseAuthenticatorData(authData);

      expect(result.flagsBuf).toBeInstanceOf(Uint8Array);
      expect(result.flagsBuf.length).toBe(1);
      expect(result.flagsBuf[0]).toBe(0b00000101);
    });

    test('should parse UP and UV flags correctly', () => {
      const authData = createAuthData({ flags: 0b00000101 }); // UP and UV
      const result = parseAuthenticatorData(authData);

      expect(result.flags.up).toBe(true);
      expect(result.flags.uv).toBe(true);
    });

    test('should correctly identify AT flag when attestation data included', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.flags.at).toBe(true);
    });

    test('should correctly identify ED flag when extensions included', () => {
      const authData = createAuthData({ includeExtensions: true });
      const result = parseAuthenticatorData(authData);

      expect(result.flags.ed).toBe(true);
    });

    test('should parse BE and BS flags correctly', () => {
      const authData = createAuthData({ flags: 0b00011001 }); // UP, BE, BS
      const result = parseAuthenticatorData(authData);

      expect(result.flags.up).toBe(true);
      expect(result.flags.be).toBe(true);
      expect(result.flags.bs).toBe(true);
    });

    test('should handle multiple flags correctly', () => {
      const authData = createAuthData({
        flags: 0b00000101, // UP and UV bits
        includeAttestedCredentialData: true,
        includeExtensions: true,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.flags.up).toBe(true);
      expect(result.flags.uv).toBe(true);
      expect(result.flags.at).toBe(true);
      expect(result.flags.ed).toBe(true);
    });
  });

  describe('counter parsing', () => {
    test('should parse zero counter correctly', () => {
      const authData = createAuthData({ counter: 0 });
      const result = parseAuthenticatorData(authData);

      expect(result.counter).toBe(0);
    });

    test('should parse counter value correctly', () => {
      const authData = createAuthData({ counter: 42 });
      const result = parseAuthenticatorData(authData);

      expect(result.counter).toBe(42);
    });

    test('should parse large counter value correctly', () => {
      const authData = createAuthData({ counter: 4294967295 }); // Max uint32
      const result = parseAuthenticatorData(authData);

      expect(result.counter).toBe(4294967295);
    });

    test('should return counterBuf correctly', () => {
      const authData = createAuthData({ counter: 256 });
      const result = parseAuthenticatorData(authData);

      expect(result.counterBuf).toBeInstanceOf(Uint8Array);
      expect(result.counterBuf.length).toBe(4);
    });
  });

  describe('aaguid parsing', () => {
    test('should return undefined when attestation data not included', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result.aaguid).toBeUndefined();
    });

    test('should parse aaguid when attestation data included', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.aaguid).toBeInstanceOf(Uint8Array);
      expect(result.aaguid?.length).toBe(16);
      expect(result.aaguid).toEqual(new Uint8Array(16).fill(0x02));
    });

    test('should parse custom aaguid correctly', () => {
      const customAaguid = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        customAaguid[i] = i * 2;
      }

      const authData = createAuthData({
        includeAttestedCredentialData: true,
        aaguid: customAaguid,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.aaguid).toEqual(customAaguid);
    });
  });

  describe('credentialID parsing', () => {
    test('should return undefined when attestation data not included', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result.credentialID).toBeUndefined();
    });

    test('should parse credential ID correctly', () => {
      const expectedCredentialId = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialID).toBeInstanceOf(Uint8Array);
      expect(result.credentialID).toEqual(expectedCredentialId);
    });

    test('should handle short credential ID', () => {
      const expectedCredentialId = new Uint8Array([0x01]);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialID).toEqual(expectedCredentialId);
    });

    test('should handle long credential ID', () => {
      const expectedCredentialId = new Uint8Array(256).fill(0x0a);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialID).toEqual(expectedCredentialId);
    });

    test('should handle empty credential ID', () => {
      const expectedCredentialId = new Uint8Array(0);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialID).toEqual(expectedCredentialId);
    });
  });

  describe('credentialPublicKey parsing', () => {
    test('should return undefined when attestation data not included', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result.credentialPublicKey).toBeUndefined();
    });

    test('should parse public key when attestation data included', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialPublicKey).toBeInstanceOf(Map);
    });

    test('should parse EC public key correctly', () => {
      const ecPublicKey = createECPublicKey();

      const authData = createAuthData({
        includeAttestedCredentialData: true,
        publicKey: ecPublicKey,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialPublicKey).toBeInstanceOf(Map);
      expect(result.credentialPublicKey!.get(COSEKeyParam.kty)).toBe(
        COSEKeyType.EC,
      );
      expect(
        (result.credentialPublicKey as COSEPublicKeyEC)!.get(
          COSEKeyTypeParam.crv,
        ),
      ).toBe(COSEKeyCurveName['P-256']);
    });

    test('should parse RSA public key correctly', () => {
      const rsaPublicKey = createRSAPublicKey();

      const authData = createAuthData({
        includeAttestedCredentialData: true,
        publicKey: rsaPublicKey,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialPublicKey).toBeInstanceOf(Map);
      expect(result.credentialPublicKey!.get(COSEKeyParam.kty)).toBe(
        COSEKeyType.RSA,
      );
    });

    test('should throw when AT flag is set but no public key data available', () => {
      // Create authData with AT flag set but insufficient data after credentialId
      const rpIdHash = new Uint8Array(32).fill(0x01);
      const flags = 0b01000001; // AT flag (bit 6) and UP flag (bit 0) set
      const counter = 0;
      const aaguid = new Uint8Array(16).fill(0x02);
      const credentialIdLength = 3;
      const credentialId = new Uint8Array(3).fill(0x03);

      const authDataParts: Uint8Array_[] = [];
      authDataParts.push(rpIdHash);
      authDataParts.push(new Uint8Array([flags]));

      const counterBuffer = new Uint8Array(4);
      new DataView(counterBuffer.buffer).setUint32(0, counter, false);
      authDataParts.push(counterBuffer);

      authDataParts.push(aaguid);

      const credIdLenBuffer = new Uint8Array(2);
      new DataView(credIdLenBuffer.buffer).setUint16(
        0,
        credentialIdLength,
        false,
      );
      authDataParts.push(credIdLenBuffer);

      authDataParts.push(credentialId);
      // No public key CBOR data added here

      const totalLength = authDataParts.reduce(
        (sum, part) => sum + part.length,
        0,
      );
      const authData = new Uint8Array(totalLength);
      let offset = 0;
      for (const part of authDataParts) {
        authData.set(part, offset);
        offset += part.length;
      }

      expect(() => parseAuthenticatorData(authData)).toThrow();
    });
  });

  describe('extensions parsing', () => {
    test('should return undefined when extensions not included', () => {
      const authData = createAuthData({});
      const result = parseAuthenticatorData(authData);

      expect(result.extensionsData).toBeUndefined();
      expect(result.extensionsDataBuffer).toBeUndefined();
    });

    test('should parse extensions when included', () => {
      const authData = createAuthData({ includeExtensions: true });
      const result = parseAuthenticatorData(authData);

      expect(result.extensionsData).toBeDefined();
      expect(typeof result.extensionsData).toBe('object');
      expect(result.extensionsData).toHaveProperty('example', 'value');
    });

    test('should return extensionsDataBuffer when extensions included', () => {
      const authData = createAuthData({ includeExtensions: true });
      const result = parseAuthenticatorData(authData);

      expect(result.extensionsDataBuffer).toBeInstanceOf(Uint8Array);
    });

    test('should parse custom extensions correctly', () => {
      const customExtensions = {
        credProps: { rk: true },
        customExt: 'customValue',
      };

      const authData = createAuthData({
        includeExtensions: true,
        extensions: customExtensions,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.extensionsData).toBeDefined();
      expect(result.extensionsData).toHaveProperty('credProps');
      expect(result.extensionsData).toHaveProperty('customExt', 'customValue');
    });

    test('should throw when ED flag is set but no extension data available', () => {
      // Create authData with ED flag set but insufficient data
      const rpIdHash = new Uint8Array(32).fill(0x01);
      const flags = 0b10000001; // ED flag (bit 7) and UP flag (bit 0) set
      const counter = 0;

      const authDataParts: Uint8Array_[] = [];
      authDataParts.push(rpIdHash);
      authDataParts.push(new Uint8Array([flags]));

      const counterBuffer = new Uint8Array(4);
      new DataView(counterBuffer.buffer).setUint32(0, counter, false);
      authDataParts.push(counterBuffer);
      // No extension CBOR data added here

      const totalLength = authDataParts.reduce(
        (sum, part) => sum + part.length,
        0,
      );
      const authData = new Uint8Array(totalLength);
      let offset = 0;
      for (const part of authDataParts) {
        authData.set(part, offset);
        offset += part.length;
      }

      expect(() => parseAuthenticatorData(authData)).toThrow();
    });
  });

  describe('Combined attestation data and extensions', () => {
    test('should parse both attested credential data and extensions', () => {
      const credentialId = new Uint8Array([0x05, 0x06, 0x07]);
      const extensions = { example: 'value', credProps: { rk: true } };

      const authData = createAuthData({
        includeAttestedCredentialData: true,
        includeExtensions: true,
        credentialId,
        extensions,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.credentialID).toEqual(credentialId);
      expect(result.credentialPublicKey).toBeInstanceOf(Map);
      expect(result.extensionsData).toBeDefined();
      expect(result.extensionsData).toHaveProperty('example', 'value');
    });

    test('should parse all fields correctly together', () => {
      const customRpIdHash = new Uint8Array(32).fill(0xaa);
      const customAaguid = new Uint8Array(16).fill(0xbb);
      const customCredentialId = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);
      const customExtensions = { test: 'data', nested: { value: 123 } };

      const authData = createAuthData({
        rpIdHash: customRpIdHash,
        flags: 0b00011101, // UP, UV, BE, BS
        counter: 12345,
        includeAttestedCredentialData: true,
        includeExtensions: true,
        aaguid: customAaguid,
        credentialId: customCredentialId,
        extensions: customExtensions,
      });
      const result = parseAuthenticatorData(authData);

      expect(result.rpIdHash).toEqual(customRpIdHash);
      expect(result.flags.up).toBe(true);
      expect(result.flags.uv).toBe(true);
      expect(result.flags.be).toBe(true);
      expect(result.flags.bs).toBe(true);
      expect(result.flags.at).toBe(true);
      expect(result.flags.ed).toBe(true);
      expect(result.counter).toBe(12345);
      expect(result.aaguid).toEqual(customAaguid);
      expect(result.credentialID).toEqual(customCredentialId);
      expect(result.credentialPublicKey).toBeInstanceOf(Map);
      expect(result.extensionsData).toHaveProperty('test', 'data');
    });
  });

  describe('Leftover bytes detection', () => {
    test('should throw when there are leftover bytes after parsing', () => {
      // Create valid authData and append extra bytes
      const validAuthData = createAuthData({});
      const extraBytes = new Uint8Array([0xff, 0xff, 0xff]);

      const authDataWithExtra = new Uint8Array(
        validAuthData.length + extraBytes.length,
      );
      authDataWithExtra.set(validAuthData, 0);
      authDataWithExtra.set(extraBytes, validAuthData.length);

      expect(() => parseAuthenticatorData(authDataWithExtra)).toThrow(
        'Leftover bytes detected while parsing authenticator data',
      );
    });
  });
});
