import { COSEKey, JsonWebKey } from '@repo/keys';
import { COSEKeyMapper } from '@repo/keys/mappers';
import * as cbor from 'cbor2';
import { describe, expect, test } from 'vitest';

import { AttestationObjectParser } from '../../src/AttestationObjectParser.js';

// --- Test Data ---

/**
 * Helper function to create a valid authenticator data buffer
 */
function createAuthData(options: {
  rpIdHash?: Uint8Array;
  flags?: number;
  counter?: number;
  includeAttestedCredentialData?: boolean;
  includeExtensions?: boolean;
  aaguid?: Uint8Array;
  credentialId?: Uint8Array;
  publicKey?: COSEKey;
  extensions?: Map<string, unknown>;
}): Uint8Array {
  const {
    rpIdHash = new Uint8Array(32).fill(0x01), // Default 32-byte hash
    flags = 0b00000001, // Default: only UP (User Present) bit set
    counter = 0,
    includeAttestedCredentialData = false,
    includeExtensions = false,
    aaguid = new Uint8Array(16).fill(0x02),
    credentialId = new Uint8Array([0x03, 0x04, 0x05]),
    publicKey = COSEKeyMapper.jwkToCOSEKey(
      new JsonWebKey({
        kty: 'EC',
        crv: 'P-256',
        x: 'BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ',
        y: 'BQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU',
      }),
    ),
    extensions = new Map<string, unknown>([['example', 'value']]),
  } = options;

  const parts: Uint8Array[] = [];

  // [RPIDHash (32)]
  parts.push(rpIdHash);

  // [Flags (1)]
  let finalFlags = flags;
  if (includeAttestedCredentialData) {
    finalFlags |= 0b00100000; // Set AT bit
  }
  if (includeExtensions) {
    finalFlags |= 0b01000000; // Set ED bit
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
}

/**
 * Helper function to create a complete attestation object
 */
function createAttestationObject(options: {
  fmt?: string;
  attStmt?: Map<string, unknown> | Record<string, unknown>;
  authDataOptions?: Parameters<typeof createAuthData>[0];
}): Uint8Array {
  const {
    fmt = 'none',
    attStmt = new Map<string, unknown>(),
    authDataOptions = {},
  } = options;

  const authData = createAuthData(authDataOptions);

  // Convert attStmt to Map if it's a plain object
  const attStmtMap =
    attStmt instanceof Map
      ? attStmt
      : new Map<string, unknown>(Object.entries(attStmt));

  const attestationObjectMap = new Map<string, unknown>([
    ['fmt', fmt],
    ['attStmt', attStmtMap],
    ['authData', authData],
  ]);

  return cbor.encode(attestationObjectMap);
}

// --- End Test Data ---

describe('AttestationObjectParser', () => {
  const parser = new AttestationObjectParser();

  describe('Basic parsing', () => {
    test('should parse minimal valid attestation object', () => {
      const attestationObject = createAttestationObject({});

      const result = parser.parse(attestationObject);

      expect(result.fmt).toBe('none');
      expect(result.attStmt).toBeInstanceOf(Map);
      expect(result.attStmt.size).toBe(0);
      expect(result.rpIdHash).toBeInstanceOf(Uint8Array);
      expect(result.rpIdHash.length).toBe(32);
      expect(result.flags).toBe(0b00000001);
      expect(result.counter).toBe(0);
      expect(result.aaguid).toBeNull();
      expect(result.credentialIdLength).toBeNull();
      expect(result.credentialId).toBeNull();
      expect(result.publicKey).toBeNull();
      expect(result.extensions).toBeNull();
    });

    test('should parse attestation object with attested credential data', () => {
      const credentialId = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          credentialId,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.aaguid).toBeInstanceOf(Uint8Array);
      expect(result.aaguid?.length).toBe(16);
      expect(result.credentialIdLength).toBe(4);
      expect(result.credentialId).toBeInstanceOf(Uint8Array);
      expect(result.credentialId).toEqual(credentialId);
      expect(result.publicKey).toBeInstanceOf(Map);
    });

    test('should parse attestation object with extensions', () => {
      const extensions = new Map<string, unknown>([
        ['credProps', new Map<string, unknown>([['rk', true]])],
      ]);

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeExtensions: true,
          extensions,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.extensions).toBeDefined();
      expect(typeof result.extensions).toBe('object');
    });

    test('should parse attestation object with both attested credential data and extensions', () => {
      const credentialId = new Uint8Array([0x05, 0x06, 0x07]);
      const extensions = new Map<string, unknown>([['example', 'value']]);

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          includeExtensions: true,
          credentialId,
          extensions,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.credentialId).toEqual(credentialId);
      expect(result.publicKey).toBeInstanceOf(Map);
      expect(result.extensions).toBeDefined();
      expect(typeof result.extensions).toBe('object');
    });
  });

  describe('Flags parsing', () => {
    test('should correctly identify AT flag (attestation data included)', () => {
      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
        },
      });

      const result = parser.parse(attestationObject);

      // AT flag is bit 6, so flags should have bit 6 set
      expect(result.flags & 0b00100000).toBeTruthy();
      expect(result.aaguid).not.toBeNull();
    });

    test('should correctly identify ED flag (extensions included)', () => {
      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeExtensions: true,
        },
      });

      const result = parser.parse(attestationObject);

      // ED flag is bit 7, so flags should have bit 7 set
      expect(result.flags & 0b01000000).toBeTruthy();
      expect(result.extensions).not.toBeNull();
    });

    test('should handle multiple flags correctly', () => {
      const attestationObject = createAttestationObject({
        authDataOptions: {
          flags: 0b00000101, // UP and UV bits
          includeAttestedCredentialData: true,
          includeExtensions: true,
        },
      });

      const result = parser.parse(attestationObject);

      // Should have UP (bit 0), UV (bit 2), AT (bit 6), ED (bit 7)
      expect(result.flags & 0b00000001).toBeTruthy(); // UP
      expect(result.flags & 0b00000100).toBeTruthy(); // UV
      expect(result.flags & 0b00100000).toBeTruthy(); // AT
      expect(result.flags & 0b01000000).toBeTruthy(); // ED
    });
  });

  describe('Counter parsing', () => {
    test('should parse counter value correctly', () => {
      const attestationObject = createAttestationObject({
        authDataOptions: {
          counter: 42,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.counter).toBe(42);
    });

    test('should parse large counter value correctly', () => {
      const attestationObject = createAttestationObject({
        authDataOptions: {
          counter: 4294967295, // Max uint32
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.counter).toBe(4294967295);
    });

    test('should parse zero counter correctly', () => {
      const attestationObject = createAttestationObject({
        authDataOptions: {
          counter: 0,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.counter).toBe(0);
    });
  });

  describe('Format and attestation statement', () => {
    test('should parse different fmt values', () => {
      const formats = ['none', 'packed', 'tpm', 'android-key', 'fido-u2f'];

      for (const fmt of formats) {
        const attestationObject = createAttestationObject({ fmt });
        const result = parser.parse(attestationObject);
        expect(result.fmt).toBe(fmt);
      }
    });

    test('should parse attestation statement with data', () => {
      const attStmt = {
        alg: -7,
        sig: new Uint8Array([0x01, 0x02, 0x03]),
      };

      const attestationObject = createAttestationObject({ attStmt });
      const result = parser.parse(attestationObject);

      expect(result.attStmt).toBeInstanceOf(Map);
      expect(result.attStmt.get('alg')).toBe(-7);
      expect(result.attStmt.get('sig')).toEqual(
        new Uint8Array([0x01, 0x02, 0x03]),
      );
    });
  });

  describe('Variable length credential ID', () => {
    test('should handle short credential ID', () => {
      const credentialId = new Uint8Array([0x01]);

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          credentialId,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.credentialIdLength).toBe(1);
      expect(result.credentialId).toEqual(credentialId);
    });

    test('should handle long credential ID', () => {
      const credentialId = new Uint8Array(256).fill(0x0a);

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          credentialId,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.credentialIdLength).toBe(256);
      expect(result.credentialId).toEqual(credentialId);
    });

    test('should handle empty credential ID', () => {
      const credentialId = new Uint8Array(0);

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          credentialId,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.credentialIdLength).toBe(0);
      expect(result.credentialId).toEqual(credentialId);
    });
  });

  describe('Error handling', () => {
    test('should throw on invalid attestation object (not CBOR)', () => {
      const invalidBuffer = new Uint8Array([0xff, 0xff, 0xff]);

      expect(() => parser.parse(invalidBuffer)).toThrow();
    });

    test('should throw on missing fmt field', () => {
      const invalidMap = new Map<string, unknown>([
        ['attStmt', {}],
        ['authData', createAuthData({})],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw on missing attStmt field', () => {
      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['authData', createAuthData({})],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw on missing authData field', () => {
      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', {}],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw on authData too short (missing counter)', () => {
      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', {}],
        ['authData', new Uint8Array(36)], // 32 (hash) + 1 (flags) + 3 (incomplete counter)
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw on invalid fmt type (not string)', () => {
      const invalidMap = new Map<string, unknown>([
        ['fmt', 123], // Should be string
        ['attStmt', {}],
        ['authData', createAuthData({})],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw on invalid attStmt type (not object)', () => {
      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', 'invalid'], // Should be object
        ['authData', createAuthData({})],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw on invalid authData type (not Uint8Array)', () => {
      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', new Map<string, unknown>()],
        ['authData', 'invalid'], // Should be Uint8Array
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw when AT flag is set but no public key data available', () => {
      // Create authData with AT flag set but insufficient data after credentialId
      const rpIdHash = new Uint8Array(32).fill(0x01);
      const flags = 0b00100001; // AT flag set
      const counter = 0;
      const aaguid = new Uint8Array(16).fill(0x02);
      const credentialIdLength = 3;
      const credentialId = new Uint8Array(3).fill(0x03);

      // Create minimal authData without public key
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

      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', new Map<string, unknown>()],
        ['authData', authData],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });

    test('should throw when ED flag is set but no extension data available', () => {
      // Create authData with ED flag set but insufficient data
      const rpIdHash = new Uint8Array(32).fill(0x01);
      const flags = 0b01000001; // ED flag set
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

      const invalidMap = new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', new Map<string, unknown>()],
        ['authData', authData],
      ]);
      const invalidObject = cbor.encode(invalidMap);

      expect(() => parser.parse(invalidObject)).toThrow();
    });
  });

  describe('RP ID Hash', () => {
    test('should parse custom rpIdHash correctly', () => {
      const customHash = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        customHash[i] = i;
      }

      const attestationObject = createAttestationObject({
        authDataOptions: {
          rpIdHash: customHash,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.rpIdHash).toEqual(customHash);
    });
  });

  describe('AAGUID', () => {
    test('should parse custom AAGUID correctly', () => {
      const customAaguid = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        customAaguid[i] = i * 2;
      }

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          aaguid: customAaguid,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.aaguid).toEqual(customAaguid);
    });
  });

  describe('Public Key', () => {
    test('should parse different public key formats', () => {
      // Create RSA public key using COSEKey
      const rsaJwk = new JsonWebKey({
        kty: 'RSA',
        n: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ',
        e: 'AQAB',
      });
      const rsaPublicKey = COSEKeyMapper.jwkToCOSEKey(rsaJwk);

      const attestationObject = createAttestationObject({
        authDataOptions: {
          includeAttestedCredentialData: true,
          publicKey: rsaPublicKey,
        },
      });

      const result = parser.parse(attestationObject);

      expect(result.publicKey).toBeInstanceOf(Map);
      // Verify the key can be converted back to COSEKey

      const parsedCoseKey = COSEKeyMapper.bytesToCOSEKey(result.publicKey!);
      expect(parsedCoseKey).toBeInstanceOf(COSEKey);
      // Convert to JWK to verify structure
      const parsedJwk = COSEKeyMapper.COSEKeyToJwk(parsedCoseKey);
      expect(parsedJwk.kty).toBe('RSA');
    });
  });
});
