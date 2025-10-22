import { KeyClient } from '@azure/keyvault-keys';
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

  let credentialId: string;
  let jwk: JsonWebKey;

  describe('EC', () => {
    const createEcKeyOpts = {
      rp: {
        id: 'test',
      },
      user: {
        id: Buffer.from('test'),
      },
      pubKeyCredParams: [
        {
          alg: COSEKeyAlgorithm.ES256,
          type: PublicKeyCredentialType.PUBLIC_KEY,
        },
      ],
    };

    beforeAll(async () => {
      ({ jwk } = await keyVault.createEcKey(createEcKeyOpts));
    });

    test('createEcKey', async () => {
      expect(z.uuid().safeParse(credentialId).success).toBe(true);

      expect(jwk?.crv).toBe(KeyCurveName.P256);
      expect(jwk?.kty).toBe(KeyType.EC);
      expect(z.base64url().safeParse(jwk?.x).success).toBe(true);
      expect(z.base64url().safeParse(jwk?.y).success).toBe(true);
    });

    test('getKey', async () => {
      const { jwk: jwkGet } = await keyVault.getKey({
        ...createEcKeyOpts,
        credentialId,
      });

      expect(jwkGet).toStrictEqual(jwk);
    });
  });
});
