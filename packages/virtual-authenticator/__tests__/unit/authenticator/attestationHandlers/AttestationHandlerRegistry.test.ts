import { describe, expect, test, vi } from 'vitest';

import type { AttestationHandler } from '../../../../src/authenticator/attestationHandlers/AttestationHandler';
import { AttestationHandlerRegistry } from '../../../../src/authenticator/attestationHandlers/AttestationHandlerRegistry';

const createMockHandler = (format: string): AttestationHandler => ({
  attestationFormat: format,
  createAttestation: vi.fn(),
});

describe('AttestationHandlerRegistry', () => {
  describe('register', () => {
    test('registers a handler and returns this for chaining', () => {
      const registry = new AttestationHandlerRegistry();
      const handler = createMockHandler('none');

      const result = registry.register(handler);

      expect(result).toBe(registry);
    });

    test('throws when registering duplicate attestationFormat', () => {
      const registry = new AttestationHandlerRegistry();
      const handler1 = createMockHandler('none');
      const handler2 = createMockHandler('none');

      registry.register(handler1);

      expect(() => registry.register(handler2)).toThrow(
        'AttestationHandler with attestationFormat "none" is already registered',
      );
    });
  });

  describe('registerAll', () => {
    test('registers multiple handlers and returns this', () => {
      const registry = new AttestationHandlerRegistry();
      const handlers = [createMockHandler('none'), createMockHandler('packed')];

      const result = registry.registerAll(handlers);

      expect(result).toBe(registry);
      expect(registry.has('none')).toBe(true);
      expect(registry.has('packed')).toBe(true);
    });

    test('throws when registering duplicate in batch', () => {
      const registry = new AttestationHandlerRegistry();
      const handlers = [createMockHandler('none'), createMockHandler('none')];

      expect(() => registry.registerAll(handlers)).toThrow(
        'AttestationHandler with attestationFormat "none" is already registered',
      );
    });
  });

  describe('get', () => {
    test('returns registered handler', () => {
      const registry = new AttestationHandlerRegistry();
      const handler = createMockHandler('packed');
      registry.register(handler);

      expect(registry.get('packed')).toBe(handler);
    });

    test('returns undefined for unregistered format', () => {
      const registry = new AttestationHandlerRegistry();

      expect(registry.get('packed')).toBeUndefined();
    });
  });

  describe('has', () => {
    test('returns true for registered format', () => {
      const registry = new AttestationHandlerRegistry();
      registry.register(createMockHandler('none'));

      expect(registry.has('none')).toBe(true);
    });

    test('returns false for unregistered format', () => {
      const registry = new AttestationHandlerRegistry();

      expect(registry.has('none')).toBe(false);
    });
  });

  describe('all', () => {
    test('returns empty array when no handlers registered', () => {
      const registry = new AttestationHandlerRegistry();

      expect(registry.all()).toStrictEqual([]);
    });

    test('returns all registered handlers', () => {
      const registry = new AttestationHandlerRegistry();
      const none = createMockHandler('none');
      const packed = createMockHandler('packed');
      registry.registerAll([none, packed]);

      expect(registry.all()).toStrictEqual([none, packed]);
    });
  });

  describe('attestationFormats', () => {
    test('returns empty array when no handlers registered', () => {
      const registry = new AttestationHandlerRegistry();

      expect(registry.attestationFormats()).toStrictEqual([]);
    });

    test('returns all registered format strings', () => {
      const registry = new AttestationHandlerRegistry();
      registry.registerAll([
        createMockHandler('none'),
        createMockHandler('packed'),
      ]);

      expect(registry.attestationFormats()).toStrictEqual(['none', 'packed']);
    });
  });
});
