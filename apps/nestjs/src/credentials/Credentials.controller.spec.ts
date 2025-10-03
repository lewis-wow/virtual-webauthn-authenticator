import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsController } from './Credentials.controller.js';
import { CredentialsService } from './Credentials.service.js';
import { KeyClientService } from '../key_client/KeyClient.service.js';
import { KeyClient } from '@azure/keyvault-keys';

describe('CredentialsController', () => {
  let credentailsController: CredentialsController;

  const mockKeyClient = {
    createKey: vi.fn().mockResolvedValue({ name: 'mock-key-name' }),
    getKey: vi.fn(),
    deleteKey: vi.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CredentialsController],
      providers: [
        KeyClientService,
        CredentialsService,
        {
          provide: KeyClient,
          useValue: mockKeyClient,
        },
      ],
    }).compile();

    credentailsController = app.get<CredentialsController>(
      CredentialsController,
    );
  });

  describe('root', () => {
    test('createCredentials()', async () => {
      expect(
        await credentailsController.createCredentials({
          user: {
            id: new Uint8Array(Buffer.from('test')),
            displayName: 'John doe',
            name: 'John',
          },
          challenge: '',
          rp: { name: 'Acme', id: 'acme.com' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        }),
      ).toMatchInlineSnapshot(`
        {
          "id": "b0bff60f-552b-46db-80e4-5980b31230b0",
          "rawId": {
            "data": [
              98,
              48,
              98,
              102,
              102,
              54,
              48,
              102,
              45,
              53,
              53,
              50,
              98,
              45,
              52,
              54,
              100,
              98,
              45,
              56,
              48,
              101,
              52,
              45,
              53,
              57,
              56,
              48,
              98,
              51,
              49,
              50,
              51,
              48,
              98,
              48,
            ],
            "type": "Buffer",
          },
          "response": {},
          "type": "public-key",
        }
      `);
    });
  });
});
