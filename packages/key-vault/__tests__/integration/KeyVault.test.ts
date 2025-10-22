import { KeyClient, KeyVaultKey } from '@azure/keyvault-keys';
import {
  COSEKeyAlgorithm,
  KeyCurveName,
  KeyType,
  PublicKeyCredentialType,
} from '@repo/enums';
import { JsonWebKey } from '@repo/keys';
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
  const userId = 'test';
  const rpId = 'example.com';

  describe('EC', () => {
    const publicKeyCredentialCreationOptions = {
      rp: {
        id: rpId,
      },
      user: {
        id: Buffer.from(userId),
      },
      pubKeyCredParams: [
        {
          alg: COSEKeyAlgorithm.ES256,
          type: PublicKeyCredentialType.PUBLIC_KEY,
        },
      ],
    };

    beforeAll(async () => {
      ({
        jwk,
        meta: { keyVaultKey },
      } = await keyVault.createEcKey({
        publicKeyCredentialCreationOptions,
        user: {
          id: 'test',
        },
      }));
    });

    test('createEcKey', async () => {
      expect(keyVaultKey.name).toBe(
        `${Buffer.from(rpId).toString('base64url')}-${Buffer.from(userId).toString('base64url')}`,
      );
      expect(jwk?.crv).toBe(KeyCurveName.P256);
      expect(jwk?.kty).toBe(KeyType.EC);
      expect(z.base64url().safeParse(jwk?.x).success).toBe(true);
      expect(z.base64url().safeParse(jwk?.y).success).toBe(true);
    });

    test('getKey', async () => {
      const { jwk: jwkGet } = await keyVault.getKey(keyVaultKey.name);

      expect(jwkGet).toStrictEqual(jwk);
    });
  });
});
