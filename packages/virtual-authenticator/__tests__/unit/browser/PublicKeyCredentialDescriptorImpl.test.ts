import type { AuthenticatorTransport } from '@repo/types/dom';
import { describe, expect, test } from 'vitest';

import { PublicKeyCredentialDescriptorImpl } from '../../../src/browser/PublicKeyCredentialDescriptorImpl.js';
import { PublicKeyCredentialType } from '../../../src/enums/index.js';

describe('PublicKeyCredentialDescriptorImpl', () => {
  describe('constructor', () => {
    test('should create instance with id only', () => {
      const id = new Uint8Array([1, 2, 3, 4, 5]);

      const descriptor = new PublicKeyCredentialDescriptorImpl({ id });

      expect(descriptor.type).toBe(PublicKeyCredentialType.PUBLIC_KEY);
      expect(descriptor.transports).toBeUndefined();
      // id is converted to BufferSource (ArrayBuffer)
      expect(new Uint8Array(descriptor.id as ArrayBuffer)).toEqual(id);
    });

    test('should create instance with id and transports', () => {
      const id = new Uint8Array(16);
      const transports: AuthenticatorTransport[] = ['usb', 'nfc'];

      const descriptor = new PublicKeyCredentialDescriptorImpl({
        id,
        transports,
      });

      expect(descriptor.id).toBeInstanceOf(ArrayBuffer);
      expect(descriptor.transports).toEqual(['usb', 'nfc']);
    });

    test('should always set type to public-key', () => {
      const descriptor = new PublicKeyCredentialDescriptorImpl({
        id: new Uint8Array(8),
      });

      expect(descriptor.type).toBe('public-key');
    });
  });

  describe('id property', () => {
    test('should convert Uint8Array to BufferSource', () => {
      const id = new Uint8Array([0x01, 0x02, 0x03]);

      const descriptor = new PublicKeyCredentialDescriptorImpl({ id });

      expect(new Uint8Array(descriptor.id as ArrayBuffer)).toEqual(id);
    });

    test('should preserve id data correctly', () => {
      const id = new Uint8Array([1, 2, 3, 4, 5]);

      const descriptor = new PublicKeyCredentialDescriptorImpl({ id });

      const resultBytes = new Uint8Array(descriptor.id as ArrayBuffer);
      expect(resultBytes).toEqual(id);
    });

    test('should preserve id byte length', () => {
      const id = new Uint8Array(64);

      const descriptor = new PublicKeyCredentialDescriptorImpl({ id });

      expect((descriptor.id as ArrayBuffer).byteLength).toBe(64);
    });
  });

  describe('transports property', () => {
    test('should handle all transport types', () => {
      const transports: AuthenticatorTransport[] = [
        'usb',
        'nfc',
        'ble',
        'internal',
        'hybrid',
      ];

      const descriptor = new PublicKeyCredentialDescriptorImpl({
        id: new Uint8Array(8),
        transports,
      });

      expect(descriptor.transports).toEqual(transports);
    });

    test('should handle empty transports array', () => {
      const descriptor = new PublicKeyCredentialDescriptorImpl({
        id: new Uint8Array(8),
        transports: [],
      });

      expect(descriptor.transports).toEqual([]);
    });

    test('should handle single transport', () => {
      const descriptor = new PublicKeyCredentialDescriptorImpl({
        id: new Uint8Array(8),
        transports: ['internal'],
      });

      expect(descriptor.transports).toEqual(['internal']);
    });
  });
});
