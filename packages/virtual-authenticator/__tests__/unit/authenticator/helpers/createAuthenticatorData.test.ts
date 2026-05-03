import { Hash } from '@repo/crypto';
import { describe, expect, test } from 'vitest';

import { createAuthenticatorData } from '../../../../src/helpers/createAuthenticatorData.js';

const RP_ID = 'example.com';

// Flag bit positions
const FLAG_UP = 0b00000001; // Bit 0 – User Present
const FLAG_UV = 0b00000100; // Bit 2 – User Verified
const FLAG_BE = 0b00001000; // Bit 3 – Backup Eligibility
const FLAG_BS = 0b00010000; // Bit 4 – Backup State
const FLAG_AT = 0b01000000; // Bit 6 – Attested Credential Data

describe('createAuthenticatorData', () => {
  const defaults = {
    rpId: RP_ID,
    counter: 0,
    attestedCredentialData: undefined,
    requireUserVerification: false,
    userVerificationEnabled: false,
    userPresenceEnabled: true,
  } as const;

  test('returns a Uint8Array', async () => {
    const result = await createAuthenticatorData(defaults);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  test('minimum length without attested credential data is 37 bytes (32 rpIdHash + 1 flags + 4 counter)', async () => {
    const result = await createAuthenticatorData(defaults);
    expect(result.length).toBe(37);
  });

  test('first 32 bytes are the SHA-256 hash of the rpId', async () => {
    const expectedHash = Hash.sha256(Buffer.from(RP_ID));
    const result = await createAuthenticatorData(defaults);

    expect(result.slice(0, 32)).toEqual(expectedHash);
  });

  test('rpIdHash differs for different rpIds', async () => {
    const result1 = await createAuthenticatorData({
      ...defaults,
      rpId: 'example.com',
    });
    const result2 = await createAuthenticatorData({
      ...defaults,
      rpId: 'other.com',
    });

    expect(result1.slice(0, 32)).not.toEqual(result2.slice(0, 32));
  });

  test('UP flag (bit 0) is set when userPresenceEnabled is true', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      userPresenceEnabled: true,
    });
    expect(result[32]! & FLAG_UP).toBe(FLAG_UP);
  });

  test('UP flag (bit 0) is NOT set when userPresenceEnabled is false', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      userPresenceEnabled: false,
    });
    expect(result[32]! & FLAG_UP).toBe(0);
  });

  test('UV flag (bit 2) is set when userVerificationEnabled and requireUserVerification are both true', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      userVerificationEnabled: true,
      requireUserVerification: true,
    });
    expect(result[32]! & FLAG_UV).toBe(FLAG_UV);
  });

  test('UV flag (bit 2) is NOT set when userVerificationEnabled is false', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      userVerificationEnabled: false,
      requireUserVerification: true,
    });
    expect(result[32]! & FLAG_UV).toBe(0);
  });

  test('UV flag (bit 2) is NOT set when requireUserVerification is false', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      userVerificationEnabled: true,
      requireUserVerification: false,
    });
    expect(result[32]! & FLAG_UV).toBe(0);
  });

  test('BE flag (bit 3) is always set', async () => {
    const result = await createAuthenticatorData(defaults);
    expect(result[32]! & FLAG_BE).toBe(FLAG_BE);
  });

  test('BS flag (bit 4) is always set', async () => {
    const result = await createAuthenticatorData(defaults);
    expect(result[32]! & FLAG_BS).toBe(FLAG_BS);
  });

  test('AT flag (bit 6) is set when attestedCredentialData is provided', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      attestedCredentialData: new Uint8Array([0x01, 0x02]),
    });
    expect(result[32]! & FLAG_AT).toBe(FLAG_AT);
  });

  test('AT flag (bit 6) is NOT set when attestedCredentialData is undefined', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      attestedCredentialData: undefined,
    });
    expect(result[32]! & FLAG_AT).toBe(0);
  });

  test('counter is encoded as big-endian uint32 at bytes 33–36', async () => {
    const counter = 0x0102_0304;
    const result = await createAuthenticatorData({ ...defaults, counter });

    expect(result[33]).toBe(0x01);
    expect(result[34]).toBe(0x02);
    expect(result[35]).toBe(0x03);
    expect(result[36]).toBe(0x04);
  });

  test('counter of 0 encodes as four zero bytes', async () => {
    const result = await createAuthenticatorData({ ...defaults, counter: 0 });

    expect(result[33]).toBe(0x00);
    expect(result[34]).toBe(0x00);
    expect(result[35]).toBe(0x00);
    expect(result[36]).toBe(0x00);
  });

  test('counter of 1 encodes correctly', async () => {
    const result = await createAuthenticatorData({ ...defaults, counter: 1 });

    expect(result[33]).toBe(0x00);
    expect(result[34]).toBe(0x00);
    expect(result[35]).toBe(0x00);
    expect(result[36]).toBe(0x01);
  });

  test('max uint32 counter (0xFFFFFFFF) encodes correctly', async () => {
    const result = await createAuthenticatorData({
      ...defaults,
      counter: 0xffff_ffff,
    });

    expect(result[33]).toBe(0xff);
    expect(result[34]).toBe(0xff);
    expect(result[35]).toBe(0xff);
    expect(result[36]).toBe(0xff);
  });

  test('attestedCredentialData is appended after the 37-byte header', async () => {
    const attestedCredentialData = new Uint8Array([0xaa, 0xbb, 0xcc]);

    const result = await createAuthenticatorData({
      ...defaults,
      attestedCredentialData,
    });

    expect(result.length).toBe(37 + attestedCredentialData.length);
    expect(result.slice(37)).toEqual(attestedCredentialData);
  });

  test('total length equals 37 + attestedCredentialData.length when provided', async () => {
    const attestedCredentialData = new Uint8Array(128).fill(0x05);

    const result = await createAuthenticatorData({
      ...defaults,
      attestedCredentialData,
    });

    expect(result.length).toBe(37 + 128);
  });
});
