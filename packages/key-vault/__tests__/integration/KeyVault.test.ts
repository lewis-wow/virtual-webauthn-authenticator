import { KeyClient } from '@azure/keyvault-keys';
import {
  COSEAlgorithm,
  EcCurve,
  KeyType,
  PublicKeyCredentialType,
} from '@repo/enums';
import { InterceptedAzureJsonWebKey } from '@repo/types';
import { describe, test, expect, beforeAll } from 'vitest';
import { z } from 'zod';

import { KeyVault } from '../../src/KeyVault';
import { NoopCredential } from '../helpers/NoopCredential';

describe('KeyVault', () => {
  const credential = new NoopCredential();

  const keyClient = new KeyClient(
    process.env.AZURE_KEY_VAULT_HOST!,
    credential,
    {
      allowInsecureConnection: true,
      disableChallengeResourceVerification: true,
    },
  );

  const keyVault = new KeyVault({ keyClient });

  let credentialId: string;
  let key: InterceptedAzureJsonWebKey;

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
          alg: COSEAlgorithm.ES256,
          type: PublicKeyCredentialType.PUBLIC_KEY,
        },
      ],
    };

    beforeAll(async () => {
      ({ key, credentialId } = await keyVault.createEcKey(createEcKeyOpts));
    });

    test('createEcKey', async () => {
      expect(z.uuid().safeParse(credentialId).success).toBe(true);

      expect(key?.crv).toBe(EcCurve.P256);
      expect(key?.kty).toBe(KeyType.EC);
      expect(key?.x).toBeInstanceOf(Buffer);
      expect(key?.y).toBeInstanceOf(Buffer);
    });

    test('getKey', async () => {
      const { key: keyGet } = await keyVault.getKey({
        ...createEcKeyOpts,
        credentialId,
      });

      expect(keyGet).toStrictEqual(key);
    });

    test('deleteKey', async () => {
      const { key: keyDelete } = await keyVault.deleteKey({
        ...createEcKeyOpts,
        credentialId,
      });

      expect(keyDelete).toMatchObject(key);

      await expect(() =>
        keyVault.getKey({
          ...createEcKeyOpts,
          credentialId,
        }),
      ).to.rejects.toThrow();
    });
  });

  describe('RSA', () => {
    const createRsaKeyOpts = {
      rp: {
        id: 'test',
      },
      user: {
        id: Buffer.from('test'),
      },
      pubKeyCredParams: [
        {
          alg: COSEAlgorithm.RS256,
          type: PublicKeyCredentialType.PUBLIC_KEY,
        },
      ],
    };

    beforeAll(async () => {
      ({ key, credentialId } = await keyVault.createRsaKey(createRsaKeyOpts));
    });

    test('createRsaKey', async () => {
      expect(z.uuid().safeParse(credentialId).success).toBe(true);

      expect(key?.kty).toBe(KeyType.RSA);
    });

    test('getKey', async () => {
      const { key: keyGet } = await keyVault.getKey({
        ...createRsaKeyOpts,
        credentialId,
      });

      expect(keyGet).toStrictEqual(key);
    });

    test('deleteKey', async () => {
      const { key: keyDelete } = await keyVault.deleteKey({
        ...createRsaKeyOpts,
        credentialId,
      });

      expect(keyDelete).toMatchObject(key);

      await expect(() =>
        keyVault.getKey({
          ...createRsaKeyOpts,
          credentialId,
        }),
      ).to.rejects.toThrow();
    });
  });
});
