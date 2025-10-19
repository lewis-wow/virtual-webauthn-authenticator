import { KeyClient } from '@azure/keyvault-keys';
import { COSEAlgorithm, PublicKeyCredentialType } from '@repo/enums';
import { describe, test, expect } from 'vitest';

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

  test('test', async () => {
    const { keyVaultKey, credentialId } = await keyVault.createKey({
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

    expect({ keyVaultKey, credentialId }).toMatchInlineSnapshot(`
      {
        "credentialId": "efd78967-ee6d-4ae9-ac2b-b34cc9b5291a",
        "keyVaultKey": {
          "id": "https://localhost:3443/keys/dGVzdA-dGVzdA-efd78967-ee6d-4ae9-ac2b-b34cc9b5291a/9cfdbb45484d4be4ba1f02f8bbf55014",
          "key": {
            "crv": "P-256",
            "d": undefined,
            "dp": undefined,
            "dq": undefined,
            "e": undefined,
            "k": undefined,
            "keyOps": [],
            "kid": "https://localhost:3443/keys/dGVzdA-dGVzdA-efd78967-ee6d-4ae9-ac2b-b34cc9b5291a/9cfdbb45484d4be4ba1f02f8bbf55014",
            "kty": "EC",
            "n": undefined,
            "p": undefined,
            "q": undefined,
            "qi": undefined,
            "t": undefined,
            "x": {
              "data": [
                105,
                244,
                104,
                40,
                81,
                219,
                137,
                217,
                210,
                151,
                43,
                234,
                150,
                184,
                63,
                87,
                81,
                250,
                89,
                62,
                26,
                103,
                249,
                65,
                127,
                53,
                8,
                186,
                108,
                71,
                127,
                161,
              ],
              "type": "Buffer",
            },
            "y": {
              "data": [
                119,
                193,
                224,
                33,
                10,
                250,
                205,
                159,
                222,
                234,
                223,
                238,
                143,
                129,
                204,
                141,
                251,
                87,
                156,
                174,
                242,
                31,
                122,
                103,
                175,
                243,
                235,
                119,
                78,
                248,
                27,
                108,
              ],
              "type": "Buffer",
            },
          },
          "keyOperations": [],
          "keyType": "EC",
          "name": "dGVzdA-dGVzdA-efd78967-ee6d-4ae9-ac2b-b34cc9b5291a",
          "properties": {
            "createdOn": 2025-10-19T09:33:12.000Z,
            "enabled": true,
            "expiresOn": undefined,
            "exportable": undefined,
            "hsmPlatform": undefined,
            "id": "https://localhost:3443/keys/dGVzdA-dGVzdA-efd78967-ee6d-4ae9-ac2b-b34cc9b5291a/9cfdbb45484d4be4ba1f02f8bbf55014",
            "managed": false,
            "name": "dGVzdA-dGVzdA-efd78967-ee6d-4ae9-ac2b-b34cc9b5291a",
            "notBefore": undefined,
            "recoverableDays": 90,
            "recoveryLevel": "Recoverable+Purgeable",
            "releasePolicy": undefined,
            "tags": {},
            "updatedOn": 2025-10-19T09:33:12.000Z,
            "vaultUrl": "https://localhost:3443",
            "version": "9cfdbb45484d4be4ba1f02f8bbf55014",
          },
        },
      }
    `);
  });
});
