import { describe, expect, test } from 'vitest';

import { PublicKeyCredentialRpEntityImpl } from '../../../src/browser/PublicKeyCredentialRpEntityImpl.js';

describe('PublicKeyCredentialRpEntityImpl', () => {
  describe('constructor', () => {
    test('should create instance with name only', () => {
      const entity = new PublicKeyCredentialRpEntityImpl({
        name: 'Example Corp',
      });

      expect(entity.name).toBe('Example Corp');
      expect(entity.id).toBeUndefined();
    });

    test('should create instance with name and id', () => {
      const entity = new PublicKeyCredentialRpEntityImpl({
        name: 'Example Corp',
        id: 'example.com',
      });

      expect(entity.name).toBe('Example Corp');
      expect(entity.id).toBe('example.com');
    });

    test('should inherit from PublicKeyCredentialEntityImpl', () => {
      const entity = new PublicKeyCredentialRpEntityImpl({
        name: 'Test RP',
        id: 'test.com',
      });

      expect(entity.name).toBe('Test RP');
    });
  });

  describe('id property', () => {
    test('should handle domain as id', () => {
      const entity = new PublicKeyCredentialRpEntityImpl({
        name: 'Test',
        id: 'auth.example.com',
      });

      expect(entity.id).toBe('auth.example.com');
    });

    test('should handle localhost as id', () => {
      const entity = new PublicKeyCredentialRpEntityImpl({
        name: 'Development',
        id: 'localhost',
      });

      expect(entity.id).toBe('localhost');
    });

    test('should handle undefined id', () => {
      const entity = new PublicKeyCredentialRpEntityImpl({
        name: 'Test',
      });

      expect(entity.id).toBeUndefined();
    });
  });
});
