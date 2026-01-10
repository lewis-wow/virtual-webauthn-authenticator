import type { BufferSource } from '@repo/types/dom';
import type { PublicKeyCredentialRequestOptions } from '@repo/virtual-authenticator/validation';

import { bufferSourceToBytes } from './bytesConversion';

/**
 * Converts browser CredentialRequestOptions to internal PublicKeyCredentialRequestOptions.
 * Browser APIs use BufferSource (ArrayBuffer/ArrayBufferView) while internal types use Uint8Array_.
 */
export const convertBrowserRequestOptions = (
  publicKey: PublicKeyCredentialRequestOptions | undefined,
): PublicKeyCredentialRequestOptions | undefined => {
  if (!publicKey) return undefined;

  return {
    ...publicKey,
    challenge: bufferSourceToBytes(publicKey.challenge as BufferSource),
    allowCredentials: publicKey.allowCredentials?.map((cred) => ({
      ...cred,
      id: bufferSourceToBytes(cred.id as BufferSource),
    })),
  };
};
