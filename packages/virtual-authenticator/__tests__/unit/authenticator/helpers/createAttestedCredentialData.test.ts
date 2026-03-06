import { describe, expect, test } from 'vitest';

import { createAttestedCredentialData } from '../../../../src/authenticator/helpers/createAttestedCredentialData.js';

describe('createAttestedCredentialData', () => {
  const AAGUID_LENGTH = 16;
  const CREDENTIAL_ID_LENGTH_FIELD_SIZE = 2;

  test('returns a Uint8Array', async () => {
    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId: new Uint8Array([0x01, 0x02, 0x03]),
      COSEPublicKey: new Uint8Array([0x04, 0x05]),
    });

    expect(result).toBeInstanceOf(Uint8Array);
  });

  test('total length equals aaguid(16) + credentialIdLengthField(2) + credentialId.length + COSEPublicKey.length', async () => {
    const credentialId = new Uint8Array(32).fill(0x01);
    const COSEPublicKey = new Uint8Array(77).fill(0x02);

    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId,
      COSEPublicKey,
    });

    expect(result.length).toBe(
      16 + 2 + credentialId.length + COSEPublicKey.length,
    );
  });

  test('first 16 bytes are the aaguid', async () => {
    const aaguid = new Uint8Array(16);
    aaguid.set([
      0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc,
      0xdd, 0xee, 0xff, 0x00,
    ]);

    const result = await createAttestedCredentialData({
      aaguid,
      credentialId: new Uint8Array([0x01]),
      COSEPublicKey: new Uint8Array([0x02]),
    });

    expect(result.slice(0, AAGUID_LENGTH)).toEqual(aaguid);
  });

  test('bytes 16–17 encode credentialId length as big-endian uint16', async () => {
    const credentialId = new Uint8Array(300).fill(0x01); // length = 300 = 0x012C

    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId,
      COSEPublicKey: new Uint8Array([0x02]),
    });

    const lengthHigh = result[AAGUID_LENGTH];
    const lengthLow = result[AAGUID_LENGTH + 1];

    expect(lengthHigh).toBe(0x01); // high byte of 300
    expect(lengthLow).toBe(0x2c); // low byte of 300
  });

  test('credentialId length field encodes zero correctly for empty credentialId', async () => {
    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId: new Uint8Array(0),
      COSEPublicKey: new Uint8Array([0x02]),
    });

    expect(result[AAGUID_LENGTH]).toBe(0x00);
    expect(result[AAGUID_LENGTH + 1]).toBe(0x00);
  });

  test('credential ID bytes follow the length field', async () => {
    const credentialId = new Uint8Array([0xaa, 0xbb, 0xcc]);

    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId,
      COSEPublicKey: new Uint8Array([0xdd]),
    });

    const offset = AAGUID_LENGTH + CREDENTIAL_ID_LENGTH_FIELD_SIZE;
    expect(result.slice(offset, offset + credentialId.length)).toEqual(
      credentialId,
    );
  });

  test('COSEPublicKey bytes are appended after credentialId', async () => {
    const credentialId = new Uint8Array([0x01, 0x02]);
    const COSEPublicKey = new Uint8Array([0xfa, 0xfb, 0xfc]);

    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId,
      COSEPublicKey,
    });

    const offset =
      AAGUID_LENGTH + CREDENTIAL_ID_LENGTH_FIELD_SIZE + credentialId.length;
    expect(result.slice(offset)).toEqual(COSEPublicKey);
  });

  test('correctly handles a single-byte credentialId (length = 1 = 0x0001)', async () => {
    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId: new Uint8Array([0xff]),
      COSEPublicKey: new Uint8Array([0x01]),
    });

    expect(result[AAGUID_LENGTH]).toBe(0x00);
    expect(result[AAGUID_LENGTH + 1]).toBe(0x01);
  });

  test('maximum valid credentialId length of 1023 bytes encodes correctly', async () => {
    const credentialId = new Uint8Array(1023).fill(0x05);

    const result = await createAttestedCredentialData({
      aaguid: new Uint8Array(16).fill(0x00),
      credentialId,
      COSEPublicKey: new Uint8Array([0x01]),
    });

    const lengthHigh = result[AAGUID_LENGTH]!;
    const lengthLow = result[AAGUID_LENGTH + 1]!;
    const decodedLength = (lengthHigh << 8) | lengthLow;

    expect(decodedLength).toBe(1023);
  });

  test('preserves all aaguid, credentialId and COSEPublicKey bytes without modification', async () => {
    const aaguid = new Uint8Array(16).fill(0xaa);
    const credentialId = new Uint8Array([0x10, 0x20, 0x30]);
    const COSEPublicKey = new Uint8Array([0x40, 0x50, 0x60, 0x70]);

    const result = await createAttestedCredentialData({
      aaguid,
      credentialId,
      COSEPublicKey,
    });

    const idOffset = AAGUID_LENGTH + CREDENTIAL_ID_LENGTH_FIELD_SIZE;
    const keyOffset = idOffset + credentialId.length;

    expect(result.slice(0, AAGUID_LENGTH)).toEqual(aaguid);
    expect(result.slice(idOffset, idOffset + credentialId.length)).toEqual(
      credentialId,
    );
    expect(result.slice(keyOffset)).toEqual(COSEPublicKey);
  });
});
