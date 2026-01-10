import type { AuthenticatorAssertionResponse } from '@repo/types/dom';
import { describe, expect, test } from 'vitest';

import { AuthenticatorAssertionResponseImpl } from '../../../src/browser/AuthenticatorAssertionResponseImpl.js';
import { AuthenticatorAttestationResponseImpl } from '../../../src/browser/AuthenticatorAttestationResponseImpl.js';
import { PublicKeyCredentialImpl } from '../../../src/browser/PublicKeyCredentialImpl.js';
import { PublicKeyCredentialType } from '../../../src/enums/index.js';

// Mock attestation response
const createMockAttestationResponse = () => ({
  clientDataJSON: new TextEncoder().encode(JSON.stringify({ test: 'data' }))
    .buffer as ArrayBuffer,
  attestationObject: new ArrayBuffer(128),
  getAuthenticatorData: () => new ArrayBuffer(37),
  getPublicKey: () => new ArrayBuffer(65),
  getPublicKeyAlgorithm: () => -7,
  getTransports: () => ['usb', 'nfc'],
});

// Mock assertion response
const createMockAssertionResponse = (): AuthenticatorAssertionResponse => ({
  clientDataJSON: new TextEncoder().encode(JSON.stringify({ test: 'data' }))
    .buffer as ArrayBuffer,
  authenticatorData: new ArrayBuffer(37),
  signature: new ArrayBuffer(72),
  userHandle: new ArrayBuffer(16),
});

describe('PublicKeyCredentialImpl', () => {
  describe('constructor', () => {
    test('should create instance with attestation response', () => {
      const response = createMockAttestationResponse();
      const rawId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      const credential = new PublicKeyCredentialImpl({
        id: 'AQIDBAUGBwg',
        rawId: rawId.buffer,
        response: response as unknown as AuthenticatorAttestationResponseImpl,
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
      });

      expect(credential.id).toBe('AQIDBAUGBwg');
      expect(credential.rawId).toBe(rawId.buffer);
      expect(credential.type).toBe(PublicKeyCredentialType.PUBLIC_KEY);
      expect(credential.authenticatorAttachment).toBe('platform');
    });

    test('should create instance with assertion response', () => {
      const response = createMockAssertionResponse();
      const rawId = new ArrayBuffer(16);

      const credential = new PublicKeyCredentialImpl({
        id: 'test-credential-id',
        rawId,
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: 'cross-platform',
        clientExtensionResults: { appid: true },
      });

      expect(credential.id).toBe('test-credential-id');
      expect(credential.type).toBe('public-key');
      expect(credential.authenticatorAttachment).toBe('cross-platform');
    });

    test('should handle null authenticatorAttachment', () => {
      const response = createMockAssertionResponse();

      const credential = new PublicKeyCredentialImpl({
        id: 'test-id',
        rawId: new ArrayBuffer(8),
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: null,
        clientExtensionResults: {},
      });

      expect(credential.authenticatorAttachment).toBeNull();
    });
  });

  describe('getClientExtensionResults', () => {
    test('should return empty object when no extensions', () => {
      const response = createMockAssertionResponse();

      const credential = new PublicKeyCredentialImpl({
        id: 'test-id',
        rawId: new ArrayBuffer(8),
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: null,
        clientExtensionResults: {},
      });

      expect(credential.getClientExtensionResults()).toEqual({});
    });

    test('should return extension results', () => {
      const response = createMockAssertionResponse();
      const extensionResults = {
        appid: true,
        credProps: { rk: true },
      };

      const credential = new PublicKeyCredentialImpl({
        id: 'test-id',
        rawId: new ArrayBuffer(8),
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: null,
        clientExtensionResults: extensionResults,
      });

      expect(credential.getClientExtensionResults()).toEqual(extensionResults);
    });
  });

  describe('toJSON', () => {
    test('should serialize attestation credential to JSON', () => {
      const response = createMockAttestationResponse();
      const rawId = new Uint8Array([1, 2, 3, 4]);

      const credential = new PublicKeyCredentialImpl({
        id: 'AQIDBA',
        rawId: rawId.buffer,
        response: response as unknown as AuthenticatorAttestationResponseImpl,
        authenticatorAttachment: 'platform',
        clientExtensionResults: {},
      });

      const json = credential.toJSON();

      expect(json.id).toBe('AQIDBA');
      expect(json.rawId).toBe('AQIDBA'); // base64url encoded
      expect(json.type).toBe('public-key');
      expect(json.authenticatorAttachment).toBe('platform');
      expect(json.response.attestationObject).toBeDefined();
      expect(json.response.transports).toEqual(['usb', 'nfc']);
      expect(json.clientExtensionResults).toEqual({});
    });

    test('should serialize assertion credential to JSON', () => {
      const response = createMockAssertionResponse();
      const rawId = new Uint8Array([5, 6, 7, 8]);

      const credential = new PublicKeyCredentialImpl({
        id: 'BQYHCAo',
        rawId: rawId.buffer,
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: 'cross-platform',
        clientExtensionResults: { appid: true },
      });

      const json = credential.toJSON();

      expect(json.id).toBe('BQYHCAo');
      expect(json.type).toBe('public-key');
      expect(json.response.authenticatorData).toBeDefined();
      expect(json.response.signature).toBeDefined();
      expect(json.response.userHandle).toBeDefined();
      expect(json.response.attestationObject).toBeUndefined();
    });

    test('should handle null userHandle in assertion response', () => {
      const response: AuthenticatorAssertionResponse = {
        clientDataJSON: new ArrayBuffer(16),
        authenticatorData: new ArrayBuffer(37),
        signature: new ArrayBuffer(72),
        userHandle: null,
      };

      const credential = new PublicKeyCredentialImpl({
        id: 'test-id',
        rawId: new ArrayBuffer(8),
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: null,
        clientExtensionResults: {},
      });

      const json = credential.toJSON();

      expect(json.response.userHandle).toBeUndefined();
    });

    test('should encode binary data as base64url', () => {
      const response = createMockAssertionResponse();
      // Create rawId with known bytes that produce predictable base64url
      const rawId = new Uint8Array([0xff, 0xfe, 0xfd]);

      const credential = new PublicKeyCredentialImpl({
        id: 'test-id',
        rawId: rawId.buffer,
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: null,
        clientExtensionResults: {},
      });

      const json = credential.toJSON();

      // base64url should not contain + or /
      expect(json.rawId).not.toContain('+');
      expect(json.rawId).not.toContain('/');
    });
  });

  describe('type property', () => {
    test('should always be public-key', () => {
      const response = createMockAssertionResponse();

      const credential = new PublicKeyCredentialImpl({
        id: 'test',
        rawId: new ArrayBuffer(8),
        response: response as unknown as AuthenticatorAssertionResponseImpl,
        authenticatorAttachment: null,
        clientExtensionResults: {},
      });

      expect(credential.type).toBe('public-key');
      expect(credential.type).toBe(PublicKeyCredentialType.PUBLIC_KEY);
    });
  });
});
