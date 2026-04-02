import type { PublicKeyCredentialRequestOptions as DOMPublicKeyCredentialRequestOptions } from '@repo/types/dom';

import type { AuthenticationExtensionsClientInputs } from '../../validation/spec/AuthenticationExtensionsClientInputsSchema';
import type { PublicKeyCredentialRequestOptions } from '../../validation/spec/PublicKeyCredentialRequestOptionsSchema';
import { bufferSourceToBytes } from './bytesConversion';

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
    // TODO: use proper type for extensions instead of casting
    extensions: publicKey.extensions as
      | AuthenticationExtensionsClientInputs
      | undefined,
  };
};
