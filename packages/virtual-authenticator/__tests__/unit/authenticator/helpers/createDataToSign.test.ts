import { describe, expect, test } from 'vitest';

import { createDataToSign } from '../../../../src/helpers/createDataToSign.js';

describe('createDataToSign', () => {
  test('concatenates authData and clientDataHash in the correct order', () => {
    const authData = new Uint8Array([0x01, 0x02, 0x03]);
    const clientDataHash = new Uint8Array([0x04, 0x05, 0x06]);

    const result = createDataToSign({ authData, clientDataHash });

    expect(result).toEqual(
      new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]),
    );
  });

  test('returns a Uint8Array', () => {
    const authData = new Uint8Array([0xaa]);
    const clientDataHash = new Uint8Array([0xbb]);

    const result = createDataToSign({ authData, clientDataHash });

    expect(result).toBeInstanceOf(Uint8Array);
  });

  test('result length equals authData.length + clientDataHash.length', () => {
    const authData = new Uint8Array(37).fill(0x01);
    const clientDataHash = new Uint8Array(32).fill(0x02);

    const result = createDataToSign({ authData, clientDataHash });

    expect(result.length).toBe(69);
  });

  test('works when authData is empty', () => {
    const authData = new Uint8Array(0);
    const clientDataHash = new Uint8Array([0x01, 0x02]);

    const result = createDataToSign({ authData, clientDataHash });

    expect(result).toEqual(new Uint8Array([0x01, 0x02]));
  });

  test('works when clientDataHash is empty', () => {
    const authData = new Uint8Array([0x01, 0x02]);
    const clientDataHash = new Uint8Array(0);

    const result = createDataToSign({ authData, clientDataHash });

    expect(result).toEqual(new Uint8Array([0x01, 0x02]));
  });

  test('both inputs empty produces empty result', () => {
    const result = createDataToSign({
      authData: new Uint8Array(0),
      clientDataHash: new Uint8Array(0),
    });

    expect(result).toEqual(new Uint8Array(0));
    expect(result.length).toBe(0);
  });

  test('authData bytes come before clientDataHash bytes', () => {
    const authData = new Uint8Array([0xff, 0xfe]);
    const clientDataHash = new Uint8Array([0x00, 0x01]);

    const result = createDataToSign({ authData, clientDataHash });

    // First bytes are from authData
    expect(result[0]).toBe(0xff);
    expect(result[1]).toBe(0xfe);
    // Following bytes are from clientDataHash
    expect(result[2]).toBe(0x00);
    expect(result[3]).toBe(0x01);
  });

  test('handles realistic 37-byte authData and 32-byte SHA-256 clientDataHash', () => {
    const authData = new Uint8Array(37).fill(0xab);
    const clientDataHash = new Uint8Array(32).fill(0xcd);

    const result = createDataToSign({ authData, clientDataHash });

    expect(result.length).toBe(69);
    expect(result.slice(0, 37)).toEqual(authData);
    expect(result.slice(37)).toEqual(clientDataHash);
  });
});
