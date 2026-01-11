import { describe, expect, test } from 'vitest';

import { AuthenticatorAssertionResponseImpl } from '../../../src/browser/AuthenticatorAssertionResponseImpl.js';

describe('AuthenticatorAssertionResponseImpl', () => {
  const createMockData = () => ({
    clientDataJSON: new Uint8Array(64),
    authenticatorData: new Uint8Array(37),
    signature: new Uint8Array(72),
    userHandle: new Uint8Array(16),
  });

  describe('constructor', () => {
    test('should create instance with all required properties', () => {
      const data = createMockData();

      const response = new AuthenticatorAssertionResponseImpl(data);

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(response.authenticatorData).toBeInstanceOf(ArrayBuffer);
      expect(response.signature).toBeInstanceOf(ArrayBuffer);
      expect(response.userHandle).toBeInstanceOf(ArrayBuffer);
    });

    test('should handle null userHandle', () => {
      const data = {
        ...createMockData(),
        userHandle: null,
      };

      const response = new AuthenticatorAssertionResponseImpl(data);

      expect(response.userHandle).toBeNull();
    });

    test('should store all properties as readonly ArrayBuffer', () => {
      const data = createMockData();

      const response = new AuthenticatorAssertionResponseImpl(data);

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(response.authenticatorData).toBeInstanceOf(ArrayBuffer);
      expect(response.signature).toBeInstanceOf(ArrayBuffer);
      expect(response.userHandle).toBeInstanceOf(ArrayBuffer);
    });

    test('should convert Uint8Array to ArrayBuffer correctly', () => {
      const clientDataJSON = new Uint8Array([1, 2, 3, 4]);
      const authenticatorData = new Uint8Array([5, 6, 7]);
      const signature = new Uint8Array([8, 9, 10]);
      const userHandle = new Uint8Array([11, 12]);

      const response = new AuthenticatorAssertionResponseImpl({
        clientDataJSON,
        authenticatorData,
        signature,
        userHandle,
      });

      expect(new Uint8Array(response.clientDataJSON)).toEqual(clientDataJSON);
      expect(new Uint8Array(response.authenticatorData)).toEqual(
        authenticatorData,
      );
      expect(new Uint8Array(response.signature)).toEqual(signature);
      expect(new Uint8Array(response.userHandle!)).toEqual(userHandle);
    });
  });

  describe('property sizes', () => {
    test('should preserve ArrayBuffer byte lengths', () => {
      const clientDataJSON = new Uint8Array(128);
      const authenticatorData = new Uint8Array(37);
      const signature = new Uint8Array(64);
      const userHandle = new Uint8Array(32);

      const response = new AuthenticatorAssertionResponseImpl({
        clientDataJSON,
        authenticatorData,
        signature,
        userHandle,
      });

      expect(response.clientDataJSON.byteLength).toBe(128);
      expect(response.authenticatorData.byteLength).toBe(37);
      expect(response.signature.byteLength).toBe(64);
      expect(response.userHandle?.byteLength).toBe(32);
    });
  });
});
