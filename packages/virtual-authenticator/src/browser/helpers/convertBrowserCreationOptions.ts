import type { PublicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptionsDOM } from '@repo/types/dom';

import type { AuthenticationExtensionsClientInputs } from '../../validation/spec/AuthenticationExtensionsClientInputsSchema';
import type { PublicKeyCredentialCreationOptions } from '../../validation/spec/PublicKeyCredentialCreationOptionsSchema';
import { bufferSourceToBytes } from './bytesConversion';

/**
 * Converts browser CredentialCreationOptions to internal PublicKeyCredentialCreationOptions.
 * Browser APIs use BufferSource (ArrayBuffer/ArrayBufferView) while internal types use Uint8Array_.
 */
export const convertBrowserCreationOptions = (
  publicKey: PublicKeyCredentialCreationOptionsDOM | undefined,
): PublicKeyCredentialCreationOptions | undefined => {
  if (!publicKey) return undefined;

  return {
    ...publicKey,
    challenge: bufferSourceToBytes(publicKey.challenge),
    user: {
      ...publicKey.user,
      id: bufferSourceToBytes(publicKey.user.id),
    },
    excludeCredentials: publicKey.excludeCredentials?.map((cred) => ({
      ...cred,
      id: bufferSourceToBytes(cred.id),
    })),
    // TODO: use proper type for extensions instead of casting
    extensions: publicKey.extensions as
      | AuthenticationExtensionsClientInputs
      | undefined,
  };
};
