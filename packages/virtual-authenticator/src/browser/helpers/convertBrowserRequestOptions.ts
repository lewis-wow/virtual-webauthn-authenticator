import type { PublicKeyCredentialRequestOptions as DOMPublicKeyCredentialRequestOptions } from '@repo/types/dom';

import type { PublicKeyCredentialRequestOptions } from '../../validation/spec/PublicKeyCredentialRequestOptionsSchema';
import { bufferSourceToBytes } from './bytesConversion';

/**
 * Converts browser CredentialRequestOptions to internal PublicKeyCredentialRequestOptions.
 * Browser APIs use BufferSource (ArrayBuffer/ArrayBufferView) while internal types use Uint8Array_.
 */
export const convertBrowserRequestOptions = (
  publicKey: DOMPublicKeyCredentialRequestOptions | undefined,
): PublicKeyCredentialRequestOptions | undefined => {
  if (!publicKey) return undefined;

  return {
    ...publicKey,
    challenge: bufferSourceToBytes(publicKey.challenge),
    allowCredentials: publicKey.allowCredentials?.map((cred) => ({
      ...cred,
      id: bufferSourceToBytes(cred.id),
    })),
    // TODO: use proper type for extensions
    extensions: {},
  };
};
