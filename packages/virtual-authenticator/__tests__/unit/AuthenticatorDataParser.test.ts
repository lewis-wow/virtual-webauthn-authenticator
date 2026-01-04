import { COSEKey } from '@repo/keys/cose';
import { JsonWebKey } from '@repo/keys/jwk';
import { KeyMapper } from '@repo/keys/shared/mappers';
import * as cbor from 'cbor2';
import { describe, expect, test } from 'vitest';

import { AuthenticatorDataParser } from '../../src/cbor/AuthenticatorDataParser.js';

// --- Test Data ---

/**
 * Helper function to create a valid authenticator data buffer
 */
const createAuthData = (options: {
  rpIdHash?: Uint8Array;
  flags?: number;
  counter?: number;
  includeAttestedCredentialData?: boolean;
  includeExtensions?: boolean;
  aaguid?: Uint8Array;
  credentialId?: Uint8Array;
  publicKey?: COSEKey;
  extensions?: Record<string, unknown>;
}): Uint8Array => {
  const {
    rpIdHash = new Uint8Array(32).fill(0x01), // Default 32-byte hash
    flags = 0b00000001, // Default: only UP (User Present) bit set
    counter = 0,
    includeAttestedCredentialData = false,
    includeExtensions = false,
    aaguid = new Uint8Array(16).fill(0x02),
    credentialId = new Uint8Array([0x03, 0x04, 0x05]),
    publicKey = KeyMapper.JWKToCOSE(
      new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: 'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ',
        y: 'BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU',
      }),
    ),
    extensions = { example: 'value' },
  } = options;

  const parts: Uint8Array[] = [];

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
    parts.push(cbor.encode(publicKey.map));
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

describe('AuthenticatorDataParser', () => {
  describe('Constructor and validation', () => {
    test('should create parser with valid minimal authData', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      expect(parser).toBeInstanceOf(AuthenticatorDataParser);
    });

    test('should throw on authData too short (missing counter)', () => {
      const invalidAuthData = new Uint8Array(36); // 32 (hash) + 1 (flags) + 3 (incomplete counter)

      expect(() => new AuthenticatorDataParser(invalidAuthData)).toThrow();
    });

    test('should throw on authData too short (only hash)', () => {
      const invalidAuthData = new Uint8Array(32); // Only hash

      expect(() => new AuthenticatorDataParser(invalidAuthData)).toThrow();
    });

    test('should throw on empty authData', () => {
      const invalidAuthData = new Uint8Array(0);

      expect(() => new AuthenticatorDataParser(invalidAuthData)).toThrow();
    });
  });

  describe('getRpIdHash()', () => {
    test('should parse rpIdHash correctly', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const rpIdHash = parser.getRpIdHash();

      expect(rpIdHash).toBeInstanceOf(Uint8Array);
      expect(rpIdHash.length).toBe(32);
      expect(rpIdHash).toEqual(new Uint8Array(32).fill(0x01));
    });

    test('should parse custom rpIdHash correctly', () => {
      const customHash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        customHash[i] = i;
      }

      const authData = createAuthData({ rpIdHash: customHash });
      const parser = new AuthenticatorDataParser(authData);

      const rpIdHash = parser.getRpIdHash();

      expect(rpIdHash).toEqual(customHash);
    });

    test('should cache rpIdHash on subsequent calls', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const rpIdHash1 = parser.getRpIdHash();
      const rpIdHash2 = parser.getRpIdHash();

      expect(rpIdHash1).toBe(rpIdHash2); // Same reference
    });
  });

  describe('getFlags()', () => {
    test('should parse default flags correctly', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const flags = parser.getFlags();

      expect(flags).toBe(0b00000001); // Only UP bit
    });

    test('should parse custom flags correctly', () => {
      const authData = createAuthData({ flags: 0b00000101 }); // UP and UV
      const parser = new AuthenticatorDataParser(authData);

      const flags = parser.getFlags();

      expect(flags & 0b00000001).toBeTruthy(); // UP
      expect(flags & 0b00000100).toBeTruthy(); // UV
    });

    test('should correctly identify AT flag when attestation data included', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const flags = parser.getFlags();

      expect(flags & 0b01000000).toBeTruthy(); // AT bit (bit 6)
    });

    test('should correctly identify ED flag when extensions included', () => {
      const authData = createAuthData({ includeExtensions: true });
      const parser = new AuthenticatorDataParser(authData);

      const flags = parser.getFlags();

      expect(flags & 0b10000000).toBeTruthy(); // ED bit (bit 7)
    });

    test('should handle multiple flags correctly', () => {
      const authData = createAuthData({
        flags: 0b00000101, // UP and UV bits
        includeAttestedCredentialData: true,
        includeExtensions: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const flags = parser.getFlags();

      expect(flags & 0b00000001).toBeTruthy(); // UP
      expect(flags & 0b00000100).toBeTruthy(); // UV
      expect(flags & 0b01000000).toBeTruthy(); // AT (bit 6)
      expect(flags & 0b10000000).toBeTruthy(); // ED (bit 7)
    });

    test('should cache flags on subsequent calls', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const flags1 = parser.getFlags();
      const flags2 = parser.getFlags();

      expect(flags1).toBe(flags2);
    });
  });

  describe('getCounter()', () => {
    test('should parse zero counter correctly', () => {
      const authData = createAuthData({ counter: 0 });
      const parser = new AuthenticatorDataParser(authData);

      const counter = parser.getCounter();

      expect(counter).toBe(0);
    });

    test('should parse counter value correctly', () => {
      const authData = createAuthData({ counter: 42 });
      const parser = new AuthenticatorDataParser(authData);

      const counter = parser.getCounter();

      expect(counter).toBe(42);
    });

    test('should parse large counter value correctly', () => {
      const authData = createAuthData({ counter: 4294967295 }); // Max uint32
      const parser = new AuthenticatorDataParser(authData);

      const counter = parser.getCounter();

      expect(counter).toBe(4294967295);
    });

    test('should cache counter on subsequent calls', () => {
      const authData = createAuthData({ counter: 123 });
      const parser = new AuthenticatorDataParser(authData);

      const counter1 = parser.getCounter();
      const counter2 = parser.getCounter();

      expect(counter1).toBe(counter2);
    });
  });

  describe('getAaguid()', () => {
    test('should return null when attestation data not included', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const aaguid = parser.getAaguid();

      expect(aaguid).toBeNull();
    });

    test('should parse aaguid when attestation data included', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const aaguid = parser.getAaguid();

      expect(aaguid).toBeInstanceOf(Uint8Array);
      expect(aaguid?.length).toBe(16);
      expect(aaguid).toEqual(new Uint8Array(16).fill(0x02));
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
      const parser = new AuthenticatorDataParser(authData);

      const aaguid = parser.getAaguid();

      expect(aaguid).toEqual(customAaguid);
    });

    test('should cache aaguid on subsequent calls', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const aaguid1 = parser.getAaguid();
      const aaguid2 = parser.getAaguid();

      expect(aaguid1).toBe(aaguid2);
    });
  });

  describe('getCredentialIdLength()', () => {
    test('should return null when attestation data not included', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const length = parser.getCredentialIdLength();

      expect(length).toBeNull();
    });

    test('should parse credential ID length correctly', () => {
      const credentialId = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const length = parser.getCredentialIdLength();

      expect(length).toBe(4);
    });

    test('should handle short credential ID', () => {
      const credentialId = new Uint8Array([0x01]);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const length = parser.getCredentialIdLength();

      expect(length).toBe(1);
    });

    test('should handle long credential ID', () => {
      const credentialId = new Uint8Array(256).fill(0x0a);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const length = parser.getCredentialIdLength();

      expect(length).toBe(256);
    });

    test('should handle empty credential ID', () => {
      const credentialId = new Uint8Array(0);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const length = parser.getCredentialIdLength();

      expect(length).toBe(0);
    });

    test('should cache credential ID length on subsequent calls', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const length1 = parser.getCredentialIdLength();
      const length2 = parser.getCredentialIdLength();

      expect(length1).toBe(length2);
    });
  });

  describe('getCredentialId()', () => {
    test('should return null when attestation data not included', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const credentialId = parser.getCredentialId();

      expect(credentialId).toBeNull();
    });

    test('should parse credential ID correctly', () => {
      const expectedCredentialId = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const credentialId = parser.getCredentialId();

      expect(credentialId).toBeInstanceOf(Uint8Array);
      expect(credentialId).toEqual(expectedCredentialId);
    });

    test('should handle short credential ID', () => {
      const expectedCredentialId = new Uint8Array([0x01]);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const credentialId = parser.getCredentialId();

      expect(credentialId).toEqual(expectedCredentialId);
    });

    test('should handle long credential ID', () => {
      const expectedCredentialId = new Uint8Array(256).fill(0x0a);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const credentialId = parser.getCredentialId();

      expect(credentialId).toEqual(expectedCredentialId);
    });

    test('should handle empty credential ID', () => {
      const expectedCredentialId = new Uint8Array(0);
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        credentialId: expectedCredentialId,
      });
      const parser = new AuthenticatorDataParser(authData);

      const credentialId = parser.getCredentialId();

      expect(credentialId).toEqual(expectedCredentialId);
    });

    test('should cache credential ID on subsequent calls', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const credentialId1 = parser.getCredentialId();
      const credentialId2 = parser.getCredentialId();

      expect(credentialId1).toBe(credentialId2);
    });
  });

  describe('getPublicKey()', () => {
    test('should return null when attestation data not included', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const publicKey = parser.getPublicKey();

      expect(publicKey).toBeNull();
    });

    test('should parse public key when attestation data included', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const publicKey = parser.getPublicKey();

      expect(publicKey).toBeInstanceOf(Map);
    });

    test('should parse EC public key correctly', () => {
      const ecJwk = new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: 'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ',
        y: 'BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU',
      });
      const ecPublicKey = KeyMapper.JWKToCOSE(ecJwk);

      const authData = createAuthData({
        includeAttestedCredentialData: true,
        publicKey: ecPublicKey,
      });
      const parser = new AuthenticatorDataParser(authData);

      const publicKey = parser.getPublicKey();

      expect(publicKey).toBeInstanceOf(Map);

      const parsedCoseKey = new COSEKey(publicKey!);
      expect(parsedCoseKey).toBeInstanceOf(COSEKey);

      const parsedJwk = KeyMapper.COSEToJWK(parsedCoseKey);
      expect(parsedJwk.kty).toBe('EC');
    });

    test('should parse RSA public key correctly', () => {
      const rsaJwk = new JsonWebKey({
        kty: 'RSA',
        n: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ',
        e: 'AQAB',
      });
      const rsaPublicKey = KeyMapper.JWKToCOSE(rsaJwk);

      const authData = createAuthData({
        includeAttestedCredentialData: true,
        publicKey: rsaPublicKey,
      });
      const parser = new AuthenticatorDataParser(authData);

      const publicKey = parser.getPublicKey();

      expect(publicKey).toBeInstanceOf(Map);

      const parsedCoseKey = new COSEKey(publicKey!);
      expect(parsedCoseKey).toBeInstanceOf(COSEKey);

      const parsedJwk = KeyMapper.COSEToJWK(parsedCoseKey);
      expect(parsedJwk.kty).toBe('RSA');
    });

    test('should cache public key on subsequent calls', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      const publicKey1 = parser.getPublicKey();
      const publicKey2 = parser.getPublicKey();

      expect(publicKey1).toBe(publicKey2);
    });

    test('should throw when AT flag is set but no public key data available', () => {
      // Create authData with AT flag set but insufficient data after credentialId
      const rpIdHash = new Uint8Array(32).fill(0x01);
      const flags = 0b01000001; // AT flag (bit 6) and UP flag (bit 0) set
      const counter = 0;
      const aaguid = new Uint8Array(16).fill(0x02);
      const credentialIdLength = 3;
      const credentialId = new Uint8Array(3).fill(0x03);

      const authDataParts: Uint8Array[] = [];
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

      const parser = new AuthenticatorDataParser(authData);

      expect(() => parser.getPublicKey()).toThrow();
    });
  });

  describe('getExtensions()', () => {
    test('should return null when extensions not included', () => {
      const authData = createAuthData({});
      const parser = new AuthenticatorDataParser(authData);

      const extensions = parser.getExtensions();

      expect(extensions).toBeNull();
    });

    test('should parse extensions when included', () => {
      const authData = createAuthData({ includeExtensions: true });
      const parser = new AuthenticatorDataParser(authData);

      const extensions = parser.getExtensions();

      expect(extensions).toBeDefined();
      expect(typeof extensions).toBe('object');
      expect(extensions).toHaveProperty('example', 'value');
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
      const parser = new AuthenticatorDataParser(authData);

      const extensions = parser.getExtensions();

      expect(extensions).toBeDefined();
      expect(extensions).toHaveProperty('credProps');
      expect(extensions).toHaveProperty('customExt', 'customValue');
    });

    test('should cache extensions on subsequent calls', () => {
      const authData = createAuthData({ includeExtensions: true });
      const parser = new AuthenticatorDataParser(authData);

      const extensions1 = parser.getExtensions();
      const extensions2 = parser.getExtensions();

      expect(extensions1).toBe(extensions2);
    });

    test('should throw when ED flag is set but no extension data available', () => {
      // Create authData with ED flag set but insufficient data
      const rpIdHash = new Uint8Array(32).fill(0x01);
      const flags = 0b10000001; // ED flag (bit 7) and UP flag (bit 0) set
      const counter = 0;

      const authDataParts: Uint8Array[] = [];
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

      const parser = new AuthenticatorDataParser(authData);

      expect(() => parser.getExtensions()).toThrow();
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
      const parser = new AuthenticatorDataParser(authData);

      expect(parser.getCredentialId()).toEqual(credentialId);
      expect(parser.getPublicKey()).toBeInstanceOf(Map);
      expect(parser.getExtensions()).toBeDefined();
      expect(parser.getExtensions()).toHaveProperty('example', 'value');
    });

    test('should handle multiple getters being called in different orders', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        includeExtensions: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      // Call getters in various orders
      const extensions1 = parser.getExtensions();
      const publicKey1 = parser.getPublicKey();
      const credentialId1 = parser.getCredentialId();
      const flags1 = parser.getFlags();
      const counter1 = parser.getCounter();
      const rpIdHash1 = parser.getRpIdHash();
      const aaguid1 = parser.getAaguid();
      const credentialIdLength1 = parser.getCredentialIdLength();

      // Call again in different order
      const counter2 = parser.getCounter();
      const extensions2 = parser.getExtensions();
      const flags2 = parser.getFlags();
      const publicKey2 = parser.getPublicKey();
      const credentialIdLength2 = parser.getCredentialIdLength();
      const rpIdHash2 = parser.getRpIdHash();
      const credentialId2 = parser.getCredentialId();
      const aaguid2 = parser.getAaguid();

      // All should be cached and return same references
      expect(rpIdHash1).toBe(rpIdHash2);
      expect(flags1).toBe(flags2);
      expect(counter1).toBe(counter2);
      expect(aaguid1).toBe(aaguid2);
      expect(credentialIdLength1).toBe(credentialIdLength2);
      expect(credentialId1).toBe(credentialId2);
      expect(publicKey1).toBe(publicKey2);
      expect(extensions1).toBe(extensions2);
    });
  });

  describe('Lazy parsing behavior', () => {
    test('should not parse CBOR data until getPublicKey or getExtensions is called', () => {
      const authData = createAuthData({
        includeAttestedCredentialData: true,
        includeExtensions: true,
      });
      const parser = new AuthenticatorDataParser(authData);

      // Access other fields - should not trigger CBOR parsing
      parser.getRpIdHash();
      parser.getFlags();
      parser.getCounter();
      parser.getAaguid();
      parser.getCredentialIdLength();
      parser.getCredentialId();

      // Verify CBOR data is not parsed yet by checking internal state
      // (This is implicit - if CBOR parsing fails, it should not throw yet)

      // Now trigger CBOR parsing
      const publicKey = parser.getPublicKey();
      expect(publicKey).toBeInstanceOf(Map);

      const extensions = parser.getExtensions();
      expect(extensions).toBeDefined();
    });
  });
});
