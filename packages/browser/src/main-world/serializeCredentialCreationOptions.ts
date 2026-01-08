import { PublicKeyCredentialCreationOptionsDtoSchema } from '@repo/virtual-authenticator/dto';

import { PublicKeyCredentialCreationOptionsBrowserSchema } from '../zod-validation/credentials/PublicKeyCredentialCreationOptionsBrowserSchema';

/**
 * Serializes browser CredentialCreationOptions to DTO format for transmission
 * via messaging (content script -> background).
 */
export function serializeCredentialCreationOptions(
  opts?: CredentialCreationOptions,
) {
  const publicKeyCredentialCreationOptionsBrowser =
    PublicKeyCredentialCreationOptionsBrowserSchema.parse(opts?.publicKey);

  const publicKeyCredentialCreationOptions =
    PublicKeyCredentialCreationOptionsDtoSchema.encode(
      publicKeyCredentialCreationOptionsBrowser,
    );

  return { publicKey: publicKeyCredentialCreationOptions };
}

export type SerializedCredentialCreationOptions = ReturnType<
  typeof serializeCredentialCreationOptions
>;
