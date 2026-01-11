import { KeyClient } from '@azure/keyvault-keys';
import { decodeCOSEPublicKey } from '@repo/keys/cbor';
import { COSEKeyAlgorithm, COSEKeyParam, COSEKeyType } from '@repo/keys/enums';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/virtual-authenticator/enums';
import type { WebAuthnPublicKeyCredentialWithMeta } from '@repo/virtual-authenticator/types';
import type { PubKeyCredParamStrict } from '@repo/virtual-authenticator/validation';
import { verifySignature } from '@simplewebauthn/server/helpers';
import { randomBytes, randomUUID } from 'node:crypto';
import { afterEach, describe, expect, test } from 'vitest';

import { AzureKeyVaultKeyProvider } from '../../src/AzureKeyVaultKeyProvider';
import { CryptographyClientFactory } from '../../src/CryptographyClientFactory';
import { NoopCredential } from '../helpers/NoopCredential';

const KEY_VAULT_HOST = process.env.AZURE_KEY_VAULT_HOST!;

const credential = new NoopCredential();

const keyClient = new KeyClient(KEY_VAULT_HOST, credential, {
  disableChallengeResourceVerification: true,
});

const cryptographyClientFactory = new CryptographyClientFactory({
  azureCredential: credential,
  cryptographyClientOptions: {
    disableChallengeResourceVerification: true,
  },
});

const keyProvider = new AzureKeyVaultKeyProvider({
  keyClient,
  cryptographyClientFactory,
});

/**
 * Integration tests for AzureKeyVaultKeyProvider
 *
 * These tests run against a lowkey-vault instance (Azure Key Vault emulator)
 * to verify that key generation and signing operations work correctly.
 */
describe('AzureKeyVaultKeyProvider', () => {
  let createdKeyNames: string[] = [];

  /**
   * Cleanup keys after each test to prevent key name conflicts
   */
  afterEach(async () => {
    for (const keyName of createdKeyNames) {
      try {
        const deletePoller = await keyClient.beginDeleteKey(keyName);
        await deletePoller.pollUntilDone();
      } catch {
        // Ignore errors during cleanup (key may not exist)
      }
    }
    createdKeyNames = [];
  });

  describe('generateKeyPair()', () => {
    describe('EC Keys (ECDSA)', () => {
      test('Should generate ES256 (P-256) key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.ES256,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();
        expect(result.webAuthnPublicKeyCredentialKeyMetaType).toBe(
          WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
        );
        expect(
          result.webAuthnPublicKeyCredentialKeyVaultKeyMeta.keyVaultKeyName,
        ).toBe(credentialId);
        expect(result.webAuthnPublicKeyCredentialKeyVaultKeyMeta.hsm).toBe(
          false,
        );

        // Verify the COSE public key structure
        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.EC);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.ES256);
      });

      test('should generate ES384 (P-384) key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.ES384,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();
        expect(result.webAuthnPublicKeyCredentialKeyMetaType).toBe(
          WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
        );

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.EC);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.ES384);
      });

      test('should generate ES512 (P-521) key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.ES512,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();
        expect(result.webAuthnPublicKeyCredentialKeyMetaType).toBe(
          WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
        );

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.EC);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.ES512);
      });
    });

    describe('RSA Keys (RSASSA-PKCS1-v1_5)', () => {
      test('should generate RS256 key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.RS256,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();
        expect(result.webAuthnPublicKeyCredentialKeyMetaType).toBe(
          WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
        );

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.RS256);
      });

      test('should generate RS384 key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.RS384,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.RS384);
      });

      test('should generate RS512 key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.RS512,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.RS512);
      });
    });

    describe('RSA Keys (RSASSA-PSS)', () => {
      test('should generate PS256 key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.PS256,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.PS256);
      });

      test('should generate PS384 key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.PS384,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.PS384);
      });

      test('should generate PS512 key pair', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.PS512,
        };

        const result = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        expect(result.COSEPublicKey).toBeDefined();

        const decodedKey = decodeCOSEPublicKey(result.COSEPublicKey);
        expect(decodedKey.get(COSEKeyParam.kty)).toBe(COSEKeyType.RSA);
        expect(decodedKey.get(COSEKeyParam.alg)).toBe(COSEKeyAlgorithm.PS512);
      });
    });

    describe('Unsupported Key Types', () => {
      test('should throw error for EdDSA keys (not supported by Azure Key Vault)', async () => {
        const credentialId = randomUUID();

        // EdDSA algorithm value is -8 (not defined in COSEKeyAlgorithm because Azure Key Vault doesn't support it)
        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: -8 as COSEKeyAlgorithm,
        };

        // Should throw an error since EdDSA/OKP is not supported
        await expect(
          keyProvider.generateKeyPair({
            webAuthnPublicKeyCredentialId: credentialId,
            pubKeyCredParams,
            hsm: false,
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe('sign()', () => {
    describe('EC Signatures (ECDSA)', () => {
      test('should sign data with ES256 key and produce verifiable signature', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.ES256,
        };

        // First generate a key pair
        const keyPairResult = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        // Create a mock WebAuthnPublicKeyCredentialWithMeta
        const webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta =
          {
            id: credentialId,
            name: null,
            userId: 'test-user-id',
            COSEPublicKey: keyPairResult.COSEPublicKey,
            counter: 0,
            transports: [],
            rpId: 'localhost',
            createdAt: new Date(),
            updatedAt: new Date(),
            webAuthnPublicKeyCredentialKeyMetaType:
              WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
              ...keyPairResult.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
              id: credentialId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };

        // Sign some test data
        const testData = new Uint8Array(randomBytes(32));

        const signResult = await keyProvider.sign({
          data: testData,
          webAuthnPublicKeyCredential,
        });

        expect(signResult.signature).toBeDefined();
        expect(signResult.signature.length).toBeGreaterThan(0);
        expect(signResult.alg).toBe(COSEKeyAlgorithm.ES256);

        // Verify the signature using simplewebauthn
        const isValid = await verifySignature({
          credentialPublicKey: keyPairResult.COSEPublicKey,
          signature: signResult.signature,
          data: testData,
        });

        expect(isValid).toBe(true);
      });

      test('should sign data with ES384 key and produce verifiable signature', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.ES384,
        };

        const keyPairResult = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        const webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta =
          {
            id: credentialId,
            name: null,
            userId: 'test-user-id',
            COSEPublicKey: keyPairResult.COSEPublicKey,
            counter: 0,
            transports: [],
            rpId: 'localhost',
            createdAt: new Date(),
            updatedAt: new Date(),
            webAuthnPublicKeyCredentialKeyMetaType:
              WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
              ...keyPairResult.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
              id: credentialId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };

        const testData = new Uint8Array(randomBytes(48));

        const signResult = await keyProvider.sign({
          data: testData,
          webAuthnPublicKeyCredential,
        });

        expect(signResult.signature).toBeDefined();
        expect(signResult.alg).toBe(COSEKeyAlgorithm.ES384);

        const isValid = await verifySignature({
          credentialPublicKey: keyPairResult.COSEPublicKey,
          signature: signResult.signature,
          data: testData,
        });

        expect(isValid).toBe(true);
      });

      test('should sign data with ES512 key and produce verifiable signature', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.ES512,
        };

        const keyPairResult = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        const webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta =
          {
            id: credentialId,
            name: null,
            userId: 'test-user-id',
            COSEPublicKey: keyPairResult.COSEPublicKey,
            counter: 0,
            transports: [],
            rpId: 'localhost',
            createdAt: new Date(),
            updatedAt: new Date(),
            webAuthnPublicKeyCredentialKeyMetaType:
              WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
              ...keyPairResult.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
              id: credentialId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };

        const testData = new Uint8Array(randomBytes(64));

        const signResult = await keyProvider.sign({
          data: testData,
          webAuthnPublicKeyCredential,
        });

        expect(signResult.signature).toBeDefined();
        expect(signResult.alg).toBe(COSEKeyAlgorithm.ES512);

        const isValid = await verifySignature({
          credentialPublicKey: keyPairResult.COSEPublicKey,
          signature: signResult.signature,
          data: testData,
        });

        expect(isValid).toBe(true);
      });
    });

    describe('RSA Signatures (RSASSA-PKCS1-v1_5)', () => {
      test('should sign data with RS256 key and produce verifiable signature', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.RS256,
        };

        const keyPairResult = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        const webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta =
          {
            id: credentialId,
            name: null,
            userId: 'test-user-id',
            COSEPublicKey: keyPairResult.COSEPublicKey,
            counter: 0,
            transports: [],
            rpId: 'localhost',
            createdAt: new Date(),
            updatedAt: new Date(),
            webAuthnPublicKeyCredentialKeyMetaType:
              WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
              ...keyPairResult.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
              id: credentialId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };

        const testData = new Uint8Array(randomBytes(32));

        const signResult = await keyProvider.sign({
          data: testData,
          webAuthnPublicKeyCredential,
        });

        expect(signResult.signature).toBeDefined();
        expect(signResult.alg).toBe(COSEKeyAlgorithm.RS256);

        const isValid = await verifySignature({
          credentialPublicKey: keyPairResult.COSEPublicKey,
          signature: signResult.signature,
          data: testData,
        });

        expect(isValid).toBe(true);
      });
    });

    describe('RSA Signatures (RSASSA-PSS)', () => {
      test('should sign data with PS256 key and produce verifiable signature', async () => {
        const credentialId = randomUUID();
        createdKeyNames.push(credentialId);

        const pubKeyCredParams: PubKeyCredParamStrict = {
          type: 'public-key',
          alg: COSEKeyAlgorithm.PS256,
        };

        const keyPairResult = await keyProvider.generateKeyPair({
          webAuthnPublicKeyCredentialId: credentialId,
          pubKeyCredParams,
          hsm: false,
        });

        const webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta =
          {
            id: credentialId,
            name: null,
            userId: 'test-user-id',
            COSEPublicKey: keyPairResult.COSEPublicKey,
            counter: 0,
            transports: [],
            rpId: 'localhost',
            createdAt: new Date(),
            updatedAt: new Date(),
            webAuthnPublicKeyCredentialKeyMetaType:
              WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
              ...keyPairResult.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
              id: credentialId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };

        const testData = new Uint8Array(randomBytes(32));

        const signResult = await keyProvider.sign({
          data: testData,
          webAuthnPublicKeyCredential,
        });

        expect(signResult.signature).toBeDefined();
        expect(signResult.alg).toBe(COSEKeyAlgorithm.PS256);

        const isValid = await verifySignature({
          credentialPublicKey: keyPairResult.COSEPublicKey,
          signature: signResult.signature,
          data: testData,
        });

        expect(isValid).toBe(true);
      });
    });
  });
});
