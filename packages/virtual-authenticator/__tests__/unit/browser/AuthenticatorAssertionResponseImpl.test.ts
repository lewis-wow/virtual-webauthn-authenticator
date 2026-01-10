import { describe, expect, test } from 'vitest';

import { AuthenticatorAssertionResponseImpl } from '../../../src/browser/AuthenticatorAssertionResponseImpl.js';

describe('AuthenticatorAssertionResponseImpl', () => {
  const createMockData = () => ({
    clientDataJSON: new ArrayBuffer(64),
    authenticatorData: new ArrayBuffer(37),
    signature: new ArrayBuffer(72),
    userHandle: new ArrayBuffer(16),
  });

  describe('constructor', () => {
    test('should create instance with all required properties', () => {
      const data = createMockData();

      const response = new AuthenticatorAssertionResponseImpl(data);

      expect(response.clientDataJSON).toBe(data.clientDataJSON);
      expect(response.authenticatorData).toBe(data.authenticatorData);
      expect(response.signature).toBe(data.signature);
      expect(response.userHandle).toBe(data.userHandle);
    });

    test('should handle null userHandle', () => {
      const data = {
        ...createMockData(),
        userHandle: null,
      };

      const response = new AuthenticatorAssertionResponseImpl(data);

      expect(response.userHandle).toBeNull();
    });

    test('should store all properties as readonly', () => {
      const data = createMockData();

      const response = new AuthenticatorAssertionResponseImpl(data);

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(response.authenticatorData).toBeInstanceOf(ArrayBuffer);
      expect(response.signature).toBeInstanceOf(ArrayBuffer);
      expect(response.userHandle).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('property sizes', () => {
    test('should preserve ArrayBuffer byte lengths', () => {
      const clientDataJSON = new ArrayBuffer(128);
      const authenticatorData = new ArrayBuffer(37);
      const signature = new ArrayBuffer(64);
      const userHandle = new ArrayBuffer(32);

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
