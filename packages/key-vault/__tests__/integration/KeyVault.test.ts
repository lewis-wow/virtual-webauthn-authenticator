import { KeyClient } from '@azure/keyvault-keys';
import {
  COSEAlgorithm,
  EcCurve,
  KeyType,
  PublicKeyCredentialType,
} from '@repo/enums';
import { describe, test, expect } from 'vitest';
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

  test('createEcKey', async () => {
    const { keyVaultKey, credentialId } = await keyVault.createEcKey({
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
    });

    expect(z.uuid().safeParse(credentialId).success).toBe(true);

    expect(keyVaultKey.key?.crv).toBe(EcCurve.P256);
    expect(keyVaultKey.key?.kty).toBe(KeyType.EC);
    expect(keyVaultKey.key?.x).toBeInstanceOf(Buffer);
    expect(keyVaultKey.key?.y).toBeInstanceOf(Buffer);
  });
});
