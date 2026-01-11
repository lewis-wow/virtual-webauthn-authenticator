import { CryptographyClient, KeyClient } from '@azure/keyvault-keys';
import { randomUUID } from 'node:crypto';
import { afterEach, describe, expect, test } from 'vitest';

import { CryptographyClientFactory } from '../../src/CryptographyClientFactory';
import { NoopCredential } from '../helpers/NoopCredential';

const KEY_VAULT_HOST = process.env.AZURE_KEY_VAULT_HOST!;

const credential = new NoopCredential();

const keyClient = new KeyClient(KEY_VAULT_HOST, credential, {
  disableChallengeResourceVerification: true,
});

/**
 * Integration tests for CryptographyClientFactory
 *
 * These tests verify that the CryptographyClientFactory correctly creates
 * CryptographyClient instances that can interact with Azure Key Vault.
 */
describe('CryptographyClientFactory', () => {
  let createdKeyNames: string[] = [];

  /**
   * Cleanup keys after each test
   */
  afterEach(async () => {
    for (const keyName of createdKeyNames) {
      try {
        const deletePoller = await keyClient.beginDeleteKey(keyName);
        await deletePoller.pollUntilDone();
      } catch {
        // Ignore errors during cleanup
      }
    }
    createdKeyNames = [];
  });

  describe('createCryptographyClient()', () => {
    test('should create CryptographyClient from KeyVaultKey object', async () => {
      const keyName = randomUUID();
      createdKeyNames.push(keyName);

      // Create a key first
      const keyVaultKey = await keyClient.createEcKey(keyName, {
        curve: 'P-256',
      });

      const factory = new CryptographyClientFactory({
        azureCredential: credential,
      });

      const cryptoClient = factory.createCryptographyClient({
        keyVaultKey,
      });

      expect(cryptoClient).toBeInstanceOf(CryptographyClient);
    });

    test('should create CryptographyClient from key URL string', async () => {
      const keyName = randomUUID();
      createdKeyNames.push(keyName);

      // Create a key first
      const keyVaultKey = await keyClient.createEcKey(keyName, {
        curve: 'P-256',
      });

      const factory = new CryptographyClientFactory({
        azureCredential: credential,
      });

      // Pass the key URL as a string
      const cryptoClient = factory.createCryptographyClient({
        keyVaultKey: keyVaultKey.id!,
      });

      expect(cryptoClient).toBeInstanceOf(CryptographyClient);
    });

    test('should create CryptographyClient that can sign data', async () => {
      const keyName = randomUUID();
      createdKeyNames.push(keyName);

      // Create a signing key
      const keyVaultKey = await keyClient.createEcKey(keyName, {
        curve: 'P-256',
        keyOps: ['sign', 'verify'],
      });

      const factory = new CryptographyClientFactory({
        azureCredential: credential,
        cryptographyClientOptions: {
          disableChallengeResourceVerification: true,
        },
      });

      const cryptoClient = factory.createCryptographyClient({
        keyVaultKey,
      });

      // Try to sign some data
      const testData = new Uint8Array(Buffer.from('test data to sign'));

      const signResult = await cryptoClient.signData('ES256', testData);

      expect(signResult.result).toBeDefined();
      expect(signResult.result.length).toBeGreaterThan(0);
    });

    test('should create CryptographyClient with custom options', async () => {
      const keyName = randomUUID();
      createdKeyNames.push(keyName);

      // Create a key first
      const keyVaultKey = await keyClient.createEcKey(keyName, {
        curve: 'P-256',
      });

      const factory = new CryptographyClientFactory({
        azureCredential: credential,
        cryptographyClientOptions: {
          // Custom options for the client
          retryOptions: {
            maxRetries: 3,
          },
        },
      });

      const cryptoClient = factory.createCryptographyClient({
        keyVaultKey,
      });

      expect(cryptoClient).toBeInstanceOf(CryptographyClient);
    });
  });
});
