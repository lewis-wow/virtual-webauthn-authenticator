import { beforeEach, describe, test, expect } from 'vitest';
import { KeyVaultService } from '../../src/services/keyvault.service.js';
import settings from '../settings.json';
import { DefaultAzureCredential } from '@azure/identity';
import { KeyVaultKey } from '@azure/keyvault-keys';

describe('KeyVaultService', () => {
  let keyValueService: KeyVaultService;
  let key: KeyVaultKey;
  const keyName = 'test-key';

  beforeEach(async () => {
    keyValueService = new KeyVaultService({
      azureKeyVaultHost: settings.azureKeyVaultHost,
      credential: new DefaultAzureCredential(),
      options: settings.azureKeyClientOptions,
    });

    key = await keyValueService.createKey(keyName);
  });

  test('getKey()', async () => {
    expect(await keyValueService.getJsonWebKey(keyName)).toStrictEqual(key.key);
  });
});
