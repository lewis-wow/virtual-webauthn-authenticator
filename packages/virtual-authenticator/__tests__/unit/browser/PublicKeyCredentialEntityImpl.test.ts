import { describe, expect, test } from 'vitest';

import { PublicKeyCredentialEntityImpl } from '../../../src/browser/PublicKeyCredentialEntityImpl.js';

describe('PublicKeyCredentialEntityImpl', () => {
  describe('constructor', () => {
    test('should create instance with name', () => {
      const entity = new PublicKeyCredentialEntityImpl({ name: 'Test Entity' });

      expect(entity.name).toBe('Test Entity');
    });

    test('should handle empty name', () => {
      const entity = new PublicKeyCredentialEntityImpl({ name: '' });

      expect(entity.name).toBe('');
    });

    test('should handle name with special characters', () => {
      const name = 'Test Entity <script>alert("xss")</script>';

      const entity = new PublicKeyCredentialEntityImpl({ name });

      expect(entity.name).toBe(name);
    });

    test('should handle unicode name', () => {
      const name = 'Тест Пользователь 测试用户 🔐';

      const entity = new PublicKeyCredentialEntityImpl({ name });

      expect(entity.name).toBe(name);
    });

    test('should handle very long name', () => {
      const name = 'A'.repeat(1000);

      const entity = new PublicKeyCredentialEntityImpl({ name });

      expect(entity.name).toBe(name);
      expect(entity.name.length).toBe(1000);
    });
  });
});
