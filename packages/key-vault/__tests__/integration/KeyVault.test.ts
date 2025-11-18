import { KeyClient, KeyVaultKey } from '@azure/keyvault-keys';
import { JsonWebKey } from '@repo/keys';
import { COSEKeyAlgorithm, KeyCurveName, KeyType } from '@repo/keys/enums';
import { KEY_VAULT_KEY_NAME } from '@repo/test-helpers';
import { PublicKeyCredentialType } from '@repo/virtual-authenticator/enums';
import { describe, test, expect, beforeAll } from 'vitest';
import { z } from 'zod';

import { CryptographyClientFactory } from '../../src/CryptographyClientFactory';
import { KeyVault } from '../../src/KeyVault';
import { NoopCredential } from '../helpers/NoopCredential';

describe('KeyVault', () => {
  const azureCredential = new NoopCredential();

  const keyClient = new KeyClient(
    process.env.AZURE_KEY_VAULT_HOST!,
    azureCredential,
    {
      allowInsecureConnection: true,
      disableChallengeResourceVerification: true,
    },
  );

  const keyVault = new KeyVault({
    keyClient,
    cryptographyClientFactory: new CryptographyClientFactory({
      azureCredential,
    }),
  });

  let jwk: JsonWebKey;
  let keyVaultKey: KeyVaultKey;

  describe('EC', () => {
    beforeAll(async () => {
      ({
        jwk,
        meta: { keyVaultKey },
      } = await keyVault.createKey({
        keyName: KEY_VAULT_KEY_NAME,
        supportedPubKeyCredParam: {
          alg: COSEKeyAlgorithm.ES256,
          type: PublicKeyCredentialType.PUBLIC_KEY,
        },
      }));
    });

    test('createKey', async () => {
      expect(keyVaultKey.name).toBe(KEY_VAULT_KEY_NAME);
      expect(jwk?.crv).toBe(KeyCurveName.P256);
      expect(jwk?.kty).toBe(KeyType.EC);
      expect(z.base64url().safeParse(jwk?.x).success).toBe(true);
      expect(z.base64url().safeParse(jwk?.y).success).toBe(true);
    });

    test('getKey', async () => {
      const { jwk: jwkGet } = await keyVault.getKey({
        keyName: keyVaultKey.name,
      });

      expect(jwkGet).toStrictEqual(jwk);
    });
  });
});
