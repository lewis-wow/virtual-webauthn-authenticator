import { COSEKeyAlgorithm } from '@repo/keys/enums';
import type { Uint8Array_ } from '@repo/types';
import { describe, expect, test, vi } from 'vitest';

import { PackedAttestationHandler } from '../../../../src/attestationHandlers/PackedAttestationHandler';
import { Fmt } from '../../../../src/enums/Fmt';
import { SignatureFailed } from '../../../../src/exceptions/SignatureFailed';
import type { IKeyProvider } from '../../../../src/types/IKeyProvider';
import type { WebAuthnPublicKeyCredentialWithMeta } from '../../../../src/types/WebAuthnPublicKeyCredentialWithMeta';

const createMockKeyProvider = (
  overrides?: Partial<IKeyProvider>,
): IKeyProvider => ({
  generateKeyPair: vi.fn(),
  sign: vi.fn().mockResolvedValue({
    signature: new Uint8Array([0x01, 0x02, 0x03]),
    alg: COSEKeyAlgorithm.ES256,
  }),
  ...overrides,
});

const MOCK_CREDENTIAL = {} as WebAuthnPublicKeyCredentialWithMeta;

const MOCK_DATA = {
  clientDataHash: new Uint8Array([0x10, 0x20]) as Uint8Array_,
  authData: new Uint8Array([0x30, 0x40]) as Uint8Array_,
};

describe('PackedAttestationHandler', () => {
  test('attestationFormat is Fmt.PACKED', () => {
    const handler = new PackedAttestationHandler({
      keyProvider: createMockKeyProvider(),
    });

    expect(handler.attestationFormat).toBe(Fmt.PACKED);
  });

  test('createAttestation returns a Map with alg and sig', async () => {
    const keyProvider = createMockKeyProvider();
    const handler = new PackedAttestationHandler({ keyProvider });

    const result = await handler.createAttestation({
      webAuthnPublicKeyCredential: MOCK_CREDENTIAL,
      data: MOCK_DATA,
    });

    expect(result).toBeInstanceOf(Map);
    expect(result.get('alg')).toBe(COSEKeyAlgorithm.ES256);
    expect(result.get('sig')).toBeInstanceOf(Uint8Array);
    expect(result.get('sig')).toStrictEqual(new Uint8Array([0x01, 0x02, 0x03]));
  });

  test('calls keyProvider.sign with concatenated authData || clientDataHash', async () => {
    const signMock = vi.fn().mockResolvedValue({
      signature: new Uint8Array([0xff]),
      alg: COSEKeyAlgorithm.ES256,
    });
    const keyProvider = createMockKeyProvider({ sign: signMock });
    const handler = new PackedAttestationHandler({ keyProvider });

    await handler.createAttestation({
      webAuthnPublicKeyCredential: MOCK_CREDENTIAL,
      data: MOCK_DATA,
    });

    expect(signMock).toHaveBeenCalledOnce();

    const callArgs = signMock.mock.calls[0]![0];
    expect(callArgs.webAuthnPublicKeyCredential).toBe(MOCK_CREDENTIAL);

    // createDataToSign concatenates authData || clientDataHash
    const expectedData = Buffer.concat([
      MOCK_DATA.authData,
      MOCK_DATA.clientDataHash,
    ]);
    expect(Buffer.from(callArgs.data)).toStrictEqual(expectedData);
  });

  test('throws SignatureFailed when keyProvider.sign rejects', async () => {
    const keyProvider = createMockKeyProvider({
      sign: vi.fn().mockRejectedValue(new Error('sign error')),
    });
    const handler = new PackedAttestationHandler({ keyProvider });

    await expect(
      handler.createAttestation({
        webAuthnPublicKeyCredential: MOCK_CREDENTIAL,
        data: MOCK_DATA,
      }),
    ).rejects.toThrow(SignatureFailed);
  });
});
