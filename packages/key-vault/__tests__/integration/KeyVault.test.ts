import { KeyClient, KeyVaultKey } from '@azure/keyvault-keys';
import {
  COSEKeyAlgorithm,
  KeyCurveName,
  KeyType,
  PublicKeyCredentialType,
} from '@repo/enums';
import { JsonWebKey } from '@repo/keys';
import { uuidToBuffer } from '@repo/utils';
import { type PublicKeyCredentialCreationOptions } from '@repo/validation';
import { describe, test, expect, beforeAll } from 'vitest';
import { z } from 'zod';

import { CryptographyClientFactory } from '../../src/CryptographyClientFactory';
import { KeyVault } from '../../src/KeyVault';
import { NoopCredential } from '../helpers/NoopCredential';
import {
  CHALLENGE_BASE64URL,
  RP_ID,
  USER_ID,
  USER_NAME,
} from '../helpers/consts';

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
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
      {
        challenge: Buffer.from(CHALLENGE_BASE64URL, 'base64url'),
        rp: {
          id: RP_ID,
          name: RP_ID,
        },
        user: {
          id: uuidToBuffer(USER_ID),
          name: USER_NAME,
          displayName: USER_NAME,
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
      } = await keyVault.createKey({
        publicKeyCredentialCreationOptions,
        user: {
          id: USER_ID,
        },
      }));
    });

    test('createKey', async () => {
      expect(keyVaultKey.name).toBe(
        `rp-${Buffer.from(RP_ID).toString('hex')}-user-${uuidToBuffer(USER_ID).toString('hex')}`,
      );
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
