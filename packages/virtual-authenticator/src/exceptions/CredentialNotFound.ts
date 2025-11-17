import { Exception } from '@repo/exception';
import type { PublicKeyCredentialRequestOptions } from '@repo/validation';
import type { PickDeep } from 'type-fest';

export class CredentialNotFound extends Exception {
  constructor(opts: {
    publicKeyCredentialRequestOptions: PickDeep<
      PublicKeyCredentialRequestOptions,
      `allowCredentials.${number}.id` | 'rpId'
    >;
    userId: string;
  }) {
    const { publicKeyCredentialRequestOptions, userId } = opts;

    super({
      code: 'CREDENTIAL_NOT_FOUND',
      message: `Credential not found for user (${userId}) with request options ${JSON.stringify(
        {
          allowCredentials:
            publicKeyCredentialRequestOptions.allowCredentials?.map(
              (allowCredential) => ({
                id: allowCredential.id,
              }),
            ),
          rpId: publicKeyCredentialRequestOptions.rpId,
        },
      )}`,
    });
  }
}
