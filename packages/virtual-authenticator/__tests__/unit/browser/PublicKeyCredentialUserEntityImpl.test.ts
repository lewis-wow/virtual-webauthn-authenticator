import { describe, expect, test } from 'vitest';

import { PublicKeyCredentialUserEntityImpl } from '../../../src/browser/PublicKeyCredentialUserEntityImpl.js';

describe('PublicKeyCredentialUserEntityImpl', () => {
  describe('constructor', () => {
    test('should create instance with all required properties', () => {
      const id = new Uint8Array([1, 2, 3, 4]);
      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'user@example.com',
        id,
        displayName: 'John Doe',
      });

      expect(entity.name).toBe('user@example.com');
      expect(entity.id).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(entity.id as ArrayBuffer)).toEqual(id);
      expect(entity.displayName).toBe('John Doe');
    });

    test('should inherit name from PublicKeyCredentialEntityImpl', () => {
      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'test@test.com',
        id: new Uint8Array(16),
        displayName: 'Test User',
      });

      expect(entity.name).toBe('test@test.com');
    });
  });

  describe('id property', () => {
    test('should convert Uint8Array to BufferSource', () => {
      const id = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);

      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'user',
        id,
        displayName: 'User',
      });

      expect(new Uint8Array(entity.id as ArrayBuffer)).toEqual(id);
    });

    test('should preserve id data correctly', () => {
      const id = new Uint8Array([1, 2, 3, 4, 5]);

      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'user',
        id,
        displayName: 'User',
      });

      expect(new Uint8Array(entity.id as ArrayBuffer)).toEqual(id);
    });

    test('should preserve id byte length', () => {
      const id = new Uint8Array(64);

      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'user',
        id,
        displayName: 'User',
      });

      expect((entity.id as ArrayBuffer).byteLength).toBe(64);
    });
  });

  describe('displayName property', () => {
    test('should handle empty displayName', () => {
      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'user@example.com',
        id: new Uint8Array(8),
        displayName: '',
      });

      expect(entity.displayName).toBe('');
    });

    test('should handle unicode displayName', () => {
      const displayName = '日本語ユーザー 🔐';

      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'user@example.com',
        id: new Uint8Array(8),
        displayName,
      });

      expect(entity.displayName).toBe(displayName);
    });

    test('should handle displayName different from name', () => {
      const entity = new PublicKeyCredentialUserEntityImpl({
        name: 'john.doe@example.com',
        id: new Uint8Array(8),
        displayName: 'John Doe',
      });

      expect(entity.name).toBe('john.doe@example.com');
      expect(entity.displayName).toBe('John Doe');
    });
  });
});
