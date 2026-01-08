import { PublicKeyCredentialRequestOptionsDtoSchema } from '@repo/virtual-authenticator/dto';

import { PublicKeyCredentialRequestOptionsBrowserSchema } from '../zod-validation/credentials/PublicKeyCredentialRequestOptionsBrowserSchema';

/**
 * Serializes browser CredentialRequestOptions to DTO format for transmission
 * via messaging (content script -> background).
 */
export function serializeCredentialRequestOptions(
  opts?: CredentialRequestOptions,
) {
  const publicKeyCredentialRequestOptionsBrowser =
    PublicKeyCredentialRequestOptionsBrowserSchema.parse(opts?.publicKey);

  const publicKeyCredentialRequestOptions =
    PublicKeyCredentialRequestOptionsDtoSchema.encode(
      publicKeyCredentialRequestOptionsBrowser,
    );

  return { publicKey: publicKeyCredentialRequestOptions };
}

export type SerializedCredentialRequestOptions = ReturnType<
  typeof serializeCredentialRequestOptions
>;
