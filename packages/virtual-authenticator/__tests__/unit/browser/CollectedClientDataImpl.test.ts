import { describe, expect, test } from 'vitest';

import { CollectedClientDataImpl } from '../../../src/browser/CollectedClientDataImpl.js';
import { CollectedClientDataType } from '../../../src/enums/index.js';

describe('CollectedClientDataImpl', () => {
  describe('constructor', () => {
    test('should create instance with all required properties for create operation', () => {
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_CREATE,
        challenge: 'dGVzdC1jaGFsbGVuZ2U',
        origin: 'https://example.com',
        crossOrigin: false,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.type).toBe(CollectedClientDataType.WEBAUTHN_CREATE);
      expect(clientData.challenge).toBe('dGVzdC1jaGFsbGVuZ2U');
      expect(clientData.origin).toBe('https://example.com');
      expect(clientData.crossOrigin).toBe(false);
      expect(clientData.tokenBinding).toBeUndefined();
    });

    test('should create instance with all required properties for get operation', () => {
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_GET,
        challenge: 'YW5vdGhlci1jaGFsbGVuZ2U',
        origin: 'https://test.example.com',
        crossOrigin: true,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.type).toBe(CollectedClientDataType.WEBAUTHN_GET);
      expect(clientData.challenge).toBe('YW5vdGhlci1jaGFsbGVuZ2U');
      expect(clientData.origin).toBe('https://test.example.com');
      expect(clientData.crossOrigin).toBe(true);
    });

    test('should handle tokenBinding when provided', () => {
      const tokenBinding = {
        status: 'present' as const,
        id: 'token-binding-id',
      };
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_CREATE,
        challenge: 'dGVzdC1jaGFsbGVuZ2U',
        origin: 'https://example.com',
        crossOrigin: false,
        tokenBinding,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.tokenBinding).toEqual(tokenBinding);
    });

    test('should handle tokenBinding with supported status', () => {
      const tokenBinding = {
        status: 'supported' as const,
      };
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_CREATE,
        challenge: 'dGVzdC1jaGFsbGVuZ2U',
        origin: 'https://example.com',
        crossOrigin: false,
        tokenBinding,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.tokenBinding?.status).toBe('supported');
      expect(clientData.tokenBinding?.id).toBeUndefined();
    });
  });

  describe('property values', () => {
    test('should preserve challenge string exactly', () => {
      const challenge = 'VGhpcyBpcyBhIHRlc3QgY2hhbGxlbmdl';
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_GET,
        challenge,
        origin: 'https://example.com',
        crossOrigin: false,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.challenge).toBe(challenge);
    });

    test('should preserve origin with port number', () => {
      const origin = 'https://localhost:8443';
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_CREATE,
        challenge: 'test',
        origin,
        crossOrigin: false,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.origin).toBe(origin);
    });

    test('should handle crossOrigin true value', () => {
      const opts = {
        type: CollectedClientDataType.WEBAUTHN_GET,
        challenge: 'test',
        origin: 'https://sub.example.com',
        crossOrigin: true,
      };

      const clientData = new CollectedClientDataImpl(opts);

      expect(clientData.crossOrigin).toBe(true);
    });
  });
});
