import type { BufferSource } from '@repo/types/dom';
import type { PublicKeyCredentialCreationOptions } from '@repo/virtual-authenticator/validation';

import { bufferSourceToBytes } from './bytesConversion';

/**
 * Converts browser CredentialCreationOptions to internal PublicKeyCredentialCreationOptions.
 * Browser APIs use BufferSource (ArrayBuffer/ArrayBufferView) while internal types use Uint8Array_.
 */
export const convertBrowserCreationOptions = (
  publicKey: PublicKeyCredentialCreationOptions | undefined,
): PublicKeyCredentialCreationOptions | undefined => {
  if (!publicKey) return undefined;

  return {
    ...publicKey,
    challenge: bufferSourceToBytes(publicKey.challenge as BufferSource),
    user: {
      ...publicKey.user,
      id: bufferSourceToBytes(publicKey.user.id as BufferSource),
    },
    excludeCredentials: publicKey.excludeCredentials?.map((cred) => ({
      ...cred,
      id: bufferSourceToBytes(cred.id as BufferSource),
    })),
  };
};
