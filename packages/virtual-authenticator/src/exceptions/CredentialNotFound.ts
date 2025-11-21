import { Exception } from '@repo/exception';
import type { PickDeep } from 'type-fest';

import type { PublicKeyCredentialRequestOptions } from '../validation/PublicKeyCredentialRequestOptionsSchema';

export const CREDENTIAL_NOT_FOUND = 'CREDENTIAL_NOT_FOUND';

export type CredentialNotFoundData = {
  publicKeyCredentialRequestOptions: PickDeep<
    PublicKeyCredentialRequestOptions,
    `allowCredentials.${number}.id` | 'rpId'
  >;
  userId: string;
};

export class CredentialNotFound extends Exception<CredentialNotFoundData> {
  static code = CREDENTIAL_NOT_FOUND;
  static status = 404;
  static message({
    userId,
    publicKeyCredentialRequestOptions,
  }: CredentialNotFoundData) {
    return `Credential not found for user (${userId}) with request options ${JSON.stringify(
      {
        allowCredentials:
          publicKeyCredentialRequestOptions.allowCredentials?.map(
            (allowCredential) => ({
              id: allowCredential.id,
            }),
          ),
        rpId: publicKeyCredentialRequestOptions.rpId,
      },
    )}`;
  }
}
